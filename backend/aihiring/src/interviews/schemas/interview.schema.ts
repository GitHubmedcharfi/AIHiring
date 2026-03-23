import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Candidate } from '../../candidates/schemas/candidate.schema';
import { Job } from '../../jobs/schemas/job.schema';

export type InterviewDocument = Interview & Document;

@Schema({ timestamps: true })
export class Interview {
  @Prop({ required: true })
  candidateName: string;

  @Prop({ required: true })
  interviewerName: string;

  @Prop({ required: true })
  interviewDate: Date;

  @Prop({ required: true })
  topic: string;

  @Prop({ default: 'scheduled' })
  status: string;

  @Prop({ default: 0 })
  score: number;

  @Prop({ type: [{ question: String, answer: String, score: Number, feedback: String }] })
  answers?: { question: string; answer: string; score: number; feedback: string }[];

  @Prop()
  completedAt?: Date;

  @Prop()
  duration: number; 
}

export const InterviewSchema = SchemaFactory.createForClass(Interview);