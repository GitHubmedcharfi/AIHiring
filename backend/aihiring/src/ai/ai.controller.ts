import { Controller, Post, Body, Res, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiProduces } from '@nestjs/swagger';
import type { Response } from 'express';
import { AiService } from './ai.service';

@ApiTags('AI')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate-question')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Generate interview question',
    description: 'Uses LLM (Ollama) to generate a technical interview question based on topic and job title',
  })
  @ApiBody({
    schema: {
      properties: {
        topic: { type: 'string', example: 'devops', description: 'Interview topic' },
        jobTitle: { type: 'string', example: 'DevOps Engineer', description: 'Job position title' },
        difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'], example: 'medium', description: 'Question difficulty level' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Question generated successfully', schema: { properties: { question: { type: 'string' } } } })
  @ApiResponse({ status: 500, description: 'LLM generation failed' })
  async generateQuestion(
    @Body() body: { topic: string; jobTitle: string; difficulty?: 'easy' | 'medium' | 'hard' },
  ) {
    const question = await this.aiService.generateInterviewQuestion(
      body.topic,
      body.jobTitle,
      body.difficulty || 'medium',
    );
    return { question };
  }

  @Post('generate-followup')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Generate follow-up interview question (avoids repeats)',
    description: 'Uses LLM to generate a new question different from previously asked ones',
  })
  @ApiBody({
    schema: {
      properties: {
        topic: { type: 'string' },
        jobTitle: { type: 'string' },
        difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] },
        previousQuestions: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  @ApiResponse({ status: 200, schema: { properties: { question: { type: 'string' } } } })
  async generateFollowUp(
    @Body() body: { topic: string; jobTitle: string; difficulty?: 'easy' | 'medium' | 'hard'; previousQuestions?: string[] },
  ) {
    const question = await this.aiService.generateFollowUpQuestion(
      body.topic,
      body.jobTitle,
      body.previousQuestions || [],
    );
    return { question };
  }

  @Post('text-to-speech')
  @ApiOperation({
    summary: 'Convert text to speech',
    description: 'Uses MaryTTS to convert text into audio (WAV format)',
  })
  @ApiBody({
    schema: {
      properties: {
        text: { type: 'string', example: 'What is Kubernetes?', description: 'Text to convert to speech' },
      },
    },
  })
  @ApiProduces('audio/wav')
  @ApiResponse({ status: 200, description: 'Audio file returned' })
  @ApiResponse({ status: 500, description: 'TTS generation failed' })
  async textToSpeech(
    @Body() body: { text: string },
    @Res() res: Response,
  ) {
    const audioBuffer = await this.aiService.textToSpeech(body.text);
    res.set('Content-Type', 'audio/wav');
    res.send(audioBuffer);
  }

  @Post('evaluate')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Evaluate candidate answer',
    description: 'Uses LLM to score and provide feedback on a candidate answer (0-100 scale)',
  })
  @ApiBody({
    schema: {
      properties: {
        question: { type: 'string', example: 'What is Docker?', description: 'The interview question' },
        answer: { type: 'string', example: 'Docker is a containerization platform...', description: 'Candidate answer' },
        topic: { type: 'string', example: 'devops', description: 'Topic category' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Evaluation completed',
    schema: {
      properties: {
        score: { type: 'number', example: 85, description: 'Score 0-100' },
        feedback: { type: 'string', example: 'Good understanding of containerization concepts', description: 'Constructive feedback' },
      },
    },
  })
  @ApiResponse({ status: 500, description: 'Evaluation failed' })
  async evaluateAnswer(
    @Body() body: { question: string; answer: string; topic: string },
  ) {
    const result = await this.aiService.evaluateAnswer(
      body.question,
      body.answer,
      body.topic,
    );
    return result;
  }

  @Post('speech-to-text')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Convert speech to text',
    description: 'Uses Whisper ASR to transcribe audio to text',
  })
  @ApiBody({
    schema: {
      properties: {
        audioBase64: { type: 'string', example: 'UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=', description: 'Base64 encoded audio (WAV format)' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Transcription successful', schema: { properties: { text: { type: 'string', description: 'Transcribed text' } } } })
  @ApiResponse({ status: 500, description: 'STT transcription failed' })
  async speechToText(
    @Body() body: { audioBase64: string },
  ) {
    const buffer = Buffer.from(body.audioBase64, 'base64');
    const text = await this.aiService.speechToText(buffer);
    return { text };
  }
}
