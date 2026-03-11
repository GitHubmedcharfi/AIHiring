import { IsString, IsOptional, IsEnum, IsNumber, IsArray } from 'class-validator';

export enum InterviewStatus {
  WAITING = 'waiting',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ERROR = 'error',
}

export enum DifficultyLevel {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

export class StartInterviewDto {
  @IsString()
  interviewId: string;

  @IsString()
  jobId: string;

  @IsString()
  candidateId: string;

  @IsString()
  topic: string;

  @IsOptional()
  @IsEnum(DifficultyLevel)
  difficulty?: DifficultyLevel;
}

export class QuestionDto {
  @IsString()
  questionId: string;

  @IsString()
  text: string;

  @IsString()
  topic: string;

  @IsNumber()
  questionNumber: number;

  @IsOptional()
  @IsNumber()
  totalQuestions?: number;
}

export class AnswerDto {
  @IsString()
  interviewId: string;

  @IsString()
  questionId: string;

  @IsString()
  audioBase64: string;

  @IsOptional()
  @IsString()
  textAnswer?: string;
}

export class EvaluationDto {
  @IsString()
  interviewId: string;

  @IsString()
  questionId: string;

  @IsNumber()
  score: number;

  @IsString()
  feedback: string;
}

export class InterviewMessageDto {
  @IsString()
  type: 'question' | 'answer' | 'evaluation' | 'audio' | 'error' | 'complete';

  @IsOptional()
  payload?: QuestionDto | AnswerDto | EvaluationDto | any;

  @IsOptional()
  @IsString()
  error?: string;

  @IsOptional()
  @IsString()
  audioBase64?: string;

  @IsOptional()
  timestamp?: number;
}

export class InterviewSession {
  interviewId: string;
  jobId: string;
  candidateId: string;
  topic: string;
  jobTitle: string;
  difficulty: DifficultyLevel;
  status: InterviewStatus;
  currentQuestionIndex: number;
  questions: string[];
  answers: { question: string; answer: string; score: number; feedback: string }[];
  startedAt: Date;
}
