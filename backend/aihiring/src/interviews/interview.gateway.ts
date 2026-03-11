import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import { JobsService } from '../jobs/jobs.service';
import {
  StartInterviewDto,
  AnswerDto,
  InterviewMessageDto,
  InterviewSession,
  InterviewStatus,
  DifficultyLevel,
} from './dto/interview-websocket.dto';
import { InterviewsService } from './interviews.service';

@WebSocketGateway({
  namespace: 'interview',
  cors: {
    origin: '*',
  },
})
@UsePipes(new ValidationPipe({ transform: true }))
export class InterviewGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(InterviewGateway.name);
  private activeSessions = new Map<string, InterviewSession>();

  constructor(
    private aiService: AiService,
    private jobsService: JobsService,
    private interviewsService: InterviewsService,
  ) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    // Clean up session if client disconnects
    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (session.candidateId === client.id) {
        session.status = InterviewStatus.COMPLETED;
        this.saveInterviewResults(session);
        this.activeSessions.delete(sessionId);
        break;
      }
    }
  }

  @SubscribeMessage('start_interview')
  async handleStartInterview(
    @MessageBody() data: StartInterviewDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    try {
      this.logger.log(`Starting interview for candidate ${data.candidateId}, topic: ${data.topic}`);

      // Get job details to get the job title
      const job = await this.jobsService.findOne(data.jobId);
      if (!job) {
        throw new Error('Job not found');
      }

      // Create interview session
      const session: InterviewSession = {
        interviewId: data.interviewId,
        jobId: data.jobId,
        candidateId: data.candidateId,
        topic: data.topic,
        jobTitle: job.title,
        difficulty: data.difficulty || DifficultyLevel.MEDIUM,
        status: InterviewStatus.IN_PROGRESS,
        currentQuestionIndex: 0,
        questions: [],
        answers: [],
        startedAt: new Date(),
      };

      this.activeSessions.set(data.interviewId, session);

      // Generate first question
      const question = await this.aiService.generateInterviewQuestion(
        data.topic,
        job.title,
        session.difficulty,
      );

      session.questions.push(question);

      // Convert to speech
      const audioBuffer = await this.aiService.textToSpeech(question);
      const audioBase64 = audioBuffer.toString('base64');

      const questionId = `q-${Date.now()}-1`;

      // Send question with audio to client
      const message: InterviewMessageDto = {
        type: 'question',
        payload: {
          questionId,
          text: question,
          topic: data.topic,
          questionNumber: 1,
          totalQuestions: 5, // Configurable
        },
        audioBase64,
        timestamp: Date.now(),
      };

      client.emit('interview_message', message);
      this.logger.log(`Sent question 1 to candidate ${data.candidateId}`);

    } catch (error) {
      this.logger.error(`Failed to start interview: ${error.message}`);
      client.emit('interview_message', {
        type: 'error',
        error: error.message,
        timestamp: Date.now(),
      });
    }
  }

  @SubscribeMessage('submit_answer')
  async handleSubmitAnswer(
    @MessageBody() data: AnswerDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    try {
      this.logger.log(`Received answer for question ${data.questionId}`);

      const session = this.activeSessions.get(data.interviewId);
      if (!session) {
        throw new Error('Interview session not found');
      }

      // Convert speech to text if audio provided
      let transcribedAnswer = data.textAnswer || '';
      if (data.audioBase64 && !transcribedAnswer) {
        const audioBuffer = Buffer.from(data.audioBase64, 'base64');
        transcribedAnswer = await this.aiService.speechToText(audioBuffer);
      }

      if (!transcribedAnswer.trim()) {
        throw new Error('No answer provided');
      }

      // Get current question
      const currentQuestion = session.questions[session.currentQuestionIndex];

      // Evaluate answer
      const evaluation = await this.aiService.evaluateAnswer(
        currentQuestion,
        transcribedAnswer,
        session.topic,
      );

      // Store answer and evaluation
      session.answers.push({
        question: currentQuestion,
        answer: transcribedAnswer,
        score: evaluation.score,
        feedback: evaluation.feedback,
      });

      // Send evaluation to client
      const evalMessage: InterviewMessageDto = {
        type: 'evaluation',
        payload: {
          interviewId: data.interviewId,
          questionId: data.questionId,
          score: evaluation.score,
          feedback: evaluation.feedback,
        },
        timestamp: Date.now(),
      };

      client.emit('interview_message', evalMessage);

      // Check if we should continue to next question or finish
      const maxQuestions = 5;
      if (session.currentQuestionIndex + 1 < maxQuestions) {
        // Generate follow-up question
        session.currentQuestionIndex++;
        const nextQuestion = await this.aiService.generateFollowUpQuestion(
          session.topic,
          session.jobTitle,
          session.questions,
        );

        session.questions.push(nextQuestion);

        // Convert to speech
        const audioBuffer = await this.aiService.textToSpeech(nextQuestion);
        const audioBase64 = audioBuffer.toString('base64');

        const nextQuestionId = `q-${Date.now()}-${session.currentQuestionIndex + 1}`;

        const message: InterviewMessageDto = {
          type: 'question',
          payload: {
            questionId: nextQuestionId,
            text: nextQuestion,
            topic: session.topic,
            questionNumber: session.currentQuestionIndex + 1,
            totalQuestions: maxQuestions,
          },
          audioBase64,
          timestamp: Date.now(),
        };

        // Small delay for natural conversation flow
        setTimeout(() => {
          client.emit('interview_message', message);
          this.logger.log(`Sent question ${session.currentQuestionIndex + 1} to candidate`);
        }, 1000);

      } else {
        // Interview complete
        session.status = InterviewStatus.COMPLETED;
        
        await this.saveInterviewResults(session);

        const completeMessage: InterviewMessageDto = {
          type: 'complete',
          payload: {
            totalScore: this.calculateAverageScore(session.answers),
            totalQuestions: session.answers.length,
            answers: session.answers,
          },
          timestamp: Date.now(),
        };

        client.emit('interview_message', completeMessage);
        this.logger.log(`Interview ${data.interviewId} completed`);

        // Clean up session
        this.activeSessions.delete(data.interviewId);
      }

    } catch (error) {
      this.logger.error(`Failed to process answer: ${error.message}`);
      client.emit('interview_message', {
        type: 'error',
        error: error.message,
        timestamp: Date.now(),
      });
    }
  }

  @SubscribeMessage('end_interview')
  async handleEndInterview(
    @MessageBody() data: { interviewId: string },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const session = this.activeSessions.get(data.interviewId);
    if (session) {
      session.status = InterviewStatus.COMPLETED;
      await this.saveInterviewResults(session);
      this.activeSessions.delete(data.interviewId);
      
      client.emit('interview_message', {
        type: 'complete',
        payload: {
          totalScore: this.calculateAverageScore(session.answers),
          totalQuestions: session.answers.length,
          answers: session.answers,
        },
        timestamp: Date.now(),
      });
    }
  }

  private calculateAverageScore(answers: { score: number }[]): number {
    if (answers.length === 0) return 0;
    const total = answers.reduce((sum, a) => sum + a.score, 0);
    return Math.round(total / answers.length);
  }

  private async saveInterviewResults(session: InterviewSession): Promise<void> {
    try {
      const averageScore = this.calculateAverageScore(session.answers);
      
      await this.interviewsService.update(session.interviewId, {
        status: 'completed',
        score: averageScore,
        answers: session.answers,
        completedAt: new Date(),
      });
      
      this.logger.log(`Saved interview results for ${session.interviewId}, score: ${averageScore}`);
    } catch (error) {
      this.logger.error(`Failed to save interview results: ${error.message}`);
    }
  }
}
