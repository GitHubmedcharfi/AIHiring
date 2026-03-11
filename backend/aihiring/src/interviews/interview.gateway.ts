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
  AudioChunkDto,
  StreamingAnswerDto,
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

      // Create interview session with streaming state
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
        audioBuffer: [],
        currentChunkIndex: 0,
        isRecording: false,
      };

      this.activeSessions.set(data.interviewId, session);

      // Generate first question
      const question = await this.aiService.generateInterviewQuestion(
        data.topic,
        job.title,
        session.difficulty,
      );

      session.questions.push(question);

      // Send audio in chunks for better real-time performance
      const questionId = `q-${Date.now()}-1`;
      
      // First send the question text immediately (low latency)
      const textMessage: InterviewMessageDto = {
        type: 'question',
        payload: {
          questionId,
          text: question,
          topic: data.topic,
          questionNumber: 1,
          totalQuestions: 5,
        },
        timestamp: Date.now(),
      };
      client.emit('interview_message', textMessage);
      
      // Then stream TTS audio in chunks
      await this.sendAudioInChunks(client, question, questionId);

      this.logger.log(`Sent question 1 with streaming audio to candidate ${data.candidateId}`);

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
    @MessageBody() data: StreamingAnswerDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    try {
      this.logger.log(`Received text answer for question ${data.questionId}`);

      const session = this.activeSessions.get(data.interviewId);
      if (!session) {
        throw new Error('Interview session not found');
      }

      // For streaming, we process text answers immediately
      // Audio chunks are handled separately via 'audio_chunk' event
      if (data.textAnswer && data.textAnswer.trim()) {
        await this.processAnswer(session, data.questionId, data.textAnswer, client);
      } else {
        // Signal ready to receive audio chunks
        session.isRecording = true;
        session.audioBuffer = [];
        session.currentChunkIndex = 0;
        
        client.emit('interview_message', {
          type: 'ready',
          message: 'Ready to receive audio chunks',
          timestamp: Date.now(),
        });
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

  @SubscribeMessage('audio_chunk')
  async handleAudioChunk(
    @MessageBody() data: AudioChunkDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    try {
      const session = this.activeSessions.get(data.interviewId);
      if (!session) {
        throw new Error('Interview session not found');
      }

      // Store the chunk
      const chunkBuffer = Buffer.from(data.audioChunkBase64, 'base64');
      session.audioBuffer.push(chunkBuffer);
      session.currentChunkIndex = data.chunkIndex;

      this.logger.log(`Received audio chunk ${data.chunkIndex} for interview ${data.interviewId}`);

      // If this is the final chunk, process all accumulated audio
      if (data.isFinal) {
        session.isRecording = false;
        
        // Combine all chunks
        const fullAudio = Buffer.concat(session.audioBuffer);
        
        // Send intermediate transcription if needed
        client.emit('interview_message', {
          type: 'transcription',
          transcription: {
            text: 'Processing...',
            isFinal: false,
          },
          timestamp: Date.now(),
        });

        // Process the complete audio
        const transcribedText = await this.aiService.speechToText(fullAudio);
        
        this.logger.log(`Transcription completed: ${transcribedText.substring(0, 50)}...`);

        // Send final transcription
        client.emit('interview_message', {
          type: 'transcription',
          transcription: {
            text: transcribedText,
            isFinal: true,
          },
          timestamp: Date.now(),
        });

        // Process the answer
        await this.processAnswer(session, data.questionId, transcribedText, client);
        
        // Clear buffer
        session.audioBuffer = [];
        session.currentChunkIndex = 0;
      }

    } catch (error) {
      this.logger.error(`Failed to process audio chunk: ${error.message}`);
      client.emit('interview_message', {
        type: 'error',
        error: error.message,
        timestamp: Date.now(),
      });
    }
  }

  private async processAnswer(
    session: InterviewSession,
    questionId: string,
    answer: string,
    client: Socket,
  ): Promise<void> {
    // Get current question
    const currentQuestion = session.questions[session.currentQuestionIndex];

    // Evaluate answer
    const evaluation = await this.aiService.evaluateAnswer(
      currentQuestion,
      answer,
      session.topic,
    );

    // Store answer and evaluation
    session.answers.push({
      question: currentQuestion,
      answer: answer,
      score: evaluation.score,
      feedback: evaluation.feedback,
    });

    // Send evaluation to client
    const evalMessage: InterviewMessageDto = {
      type: 'evaluation',
      payload: {
        interviewId: session.interviewId,
        questionId,
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

      const nextQuestionId = `q-${Date.now()}-${session.currentQuestionIndex + 1}`;

      // Send question text immediately
      const textMessage: InterviewMessageDto = {
        type: 'question',
        payload: {
          questionId: nextQuestionId,
          text: nextQuestion,
          topic: session.topic,
          questionNumber: session.currentQuestionIndex + 1,
          totalQuestions: maxQuestions,
        },
        timestamp: Date.now(),
      };
      client.emit('interview_message', textMessage);

      // Stream TTS audio
      await this.sendAudioInChunks(client, nextQuestion, nextQuestionId);

      this.logger.log(`Sent question ${session.currentQuestionIndex + 1} with streaming audio`);

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
      this.logger.log(`Interview ${session.interviewId} completed`);

      // Clean up session
      this.activeSessions.delete(session.interviewId);
    }
  }

  private async sendAudioInChunks(
    client: Socket,
    text: string,
    questionId: string,
    chunkSize: number = 8192,
  ): Promise<void> {
    try {
      // Generate full TTS audio
      const audioBuffer = await this.aiService.textToSpeech(text);
      
      // Split into chunks
      const chunks: Buffer[] = [];
      for (let i = 0; i < audioBuffer.length; i += chunkSize) {
        chunks.push(audioBuffer.slice(i, i + chunkSize));
      }

      const totalChunks = chunks.length;

      // Send chunks with small delay for streaming effect
      for (let i = 0; i < chunks.length; i++) {
        const chunkMessage: InterviewMessageDto = {
          type: 'audio_chunk',
          audioBase64: chunks[i].toString('base64'),
          chunkInfo: {
            chunkIndex: i,
            totalChunks,
            isFinal: i === chunks.length - 1,
          },
          payload: { questionId },
          timestamp: Date.now(),
        };

        client.emit('interview_message', chunkMessage);
        
        // Small delay between chunks for smooth streaming
        if (i < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }

      this.logger.log(`Streamed ${totalChunks} audio chunks for question ${questionId}`);
    } catch (error) {
      this.logger.error(`Failed to stream audio: ${error.message}`);
      client.emit('interview_message', {
        type: 'error',
        error: `Audio streaming failed: ${error.message}`,
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
