import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

const FormData = require('form-data');

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly ollamaUrl: string;
  private readonly maryTtsUrl: string;
  private readonly whisperUrl: string;

  constructor(private configService: ConfigService) {
    this.ollamaUrl = this.configService.get<string>('OLLAMA_URL') || 'http://localhost:11434';
    this.maryTtsUrl = this.configService.get<string>('MARYTTS_URL') || 'http://localhost:59125';
    this.whisperUrl = this.configService.get<string>('WHISPER_URL') || 'http://localhost:9000';
  }

  async generateInterviewQuestion(
    topic: string,
    jobTitle: string,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium',
  ): Promise<string> {
    const prompt = `You are an expert interviewer for a ${jobTitle} position. 
    Generate a single, specific technical interview question about "${topic}" at ${difficulty} difficulty level.
    The question should be concise (1-2 sentences), clear, and directly test practical knowledge of ${topic}.
    Do not include any prefixes, explanations, or numbering. Just provide the question. 
    Focus on real-world scenarios and best practices. Make the question direct and actionable.`;

    try {
      const response = await axios.post(`${this.ollamaUrl}/api/generate`, {
        model: 'phi3:mini',
        prompt,
        stream: false,
      });

      let question = response.data.response.trim();
      question = question.replace(/^(Question:|Q:|\d+\.\s*)/i, '');
      question = question.replace(/[\"']/g, '');
      
      this.logger.log(`Generated question for ${topic}: ${question.substring(0, 50)}...`);
      return question.trim();
    } catch (error) {
      this.logger.error(`Failed to generate question: ${error.message}`);
      throw new Error(`LLM generation failed: ${error.message}`);
    }
  }

  async textToSpeech(text: string): Promise<Buffer> {
    try {
      const params = new URLSearchParams({
        INPUT_TEXT: text,
        INPUT_TYPE: 'TEXT',
        OUTPUT_TYPE: 'AUDIO',
        AUDIO: 'WAVE',
        VOICE: 'cmu-slt-hsmm',
        LOCALE: 'en_US',
      });

      const response = await axios.post(
        `${this.maryTtsUrl}/process`,
        params.toString(),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          responseType: 'arraybuffer',
        },
      );

      this.logger.log(`TTS generated for text: ${text.substring(0, 30)}...`);
      return Buffer.from(response.data);
    } catch (error) {
      this.logger.error(`TTS failed: ${error.message}`);
      throw new Error(`Text-to-speech failed: ${error.message}`);
    }
  }

  async speechToText(audioBuffer: Buffer): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('audio_file', audioBuffer, {
        filename: 'audio.wav',
        contentType: 'audio/wav',
      });

      const response = await axios.post(
        `${this.whisperUrl}/asr?task=transcribe&language=en&output=json`,
        formData,
        {
          headers: formData.getHeaders(),
        },
      );

      const transcript = response.data.text?.trim() || '';
      this.logger.log(`STT transcribed: ${transcript.substring(0, 50)}...`);
      return transcript;
    } catch (error) {
      this.logger.error(`STT failed: ${error.message}`);
      throw new Error(`Speech-to-text failed: ${error.message}`);
    }
  }

  async evaluateAnswer(
    question: string,
    answer: string,
    topic: string,
  ): Promise<{ score: number; feedback: string }> {
    const prompt = `You are an expert technical interviewer evaluating a candidate's response.
    
    TOPIC: ${topic}
    QUESTION: ${question}
    CANDIDATE ANSWER: ${answer}
    
    Evaluate the answer on a scale of 0-100 based on:
    - Technical accuracy (40%)
    - Completeness of the answer (30%)
    - Clarity and communication (20%)
    - Practical application/best practices (10%)
    
    Respond in this exact format:
    SCORE: [number between 0-100]
    FEEDBACK: [2-3 sentences of constructive feedback highlighting strengths and areas for improvement]`;

    try {
      const response = await axios.post(`${this.ollamaUrl}/api/generate`, {
        model: 'phi3:mini',
        prompt,
        stream: false,
      });

      const result = response.data.response.trim();
      
      const scoreMatch = result.match(/SCORE:\s*(\d+)/i);
      const feedbackMatch = result.match(/FEEDBACK:\s*(.+?)(?=SCORE:|$)/is);
      
      const score = scoreMatch ? Math.min(100, Math.max(0, parseInt(scoreMatch[1], 10))) : 50;
      const feedback = feedbackMatch 
        ? feedbackMatch[1].trim() 
        : 'Answer received. Evaluation completed.';

      this.logger.log(`Evaluated answer: score=${score}`);
      return { score, feedback };
    } catch (error) {
      this.logger.error(`Answer evaluation failed: ${error.message}`);
      throw new Error(`Evaluation failed: ${error.message}`);
    }
  }

  async generateFollowUpQuestion(
    topic: string,
    jobTitle: string,
    previousQuestions: string[],
  ): Promise<string> {
    const previousQText = previousQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n');
    
    const prompt = `You are interviewing for a ${jobTitle} position focused on ${topic}.
    Previous questions already asked:
    ${previousQText}
    
    Generate one new, different technical interview question about ${topic} that explores a different aspect or goes deeper than previous questions.
    The question should be 1-2 sentences, specific, and practical.
    Do not include any prefixes or explanations.`;

    try {
      const response = await axios.post(`${this.ollamaUrl}/api/generate`, {
        model: 'phi3:mini',
        prompt,
        stream: false,
      });

      let question = response.data.response.trim();
      question = question.replace(/^(Question:|Q:|\d+\.\s*)/i, '');
      question = question.replace(/[\"']/g, '');
      
      return question.trim();
    } catch (error) {
      this.logger.error(`Failed to generate follow-up: ${error.message}`);
      throw new Error(`Follow-up generation failed: ${error.message}`);
    }
  }
}
