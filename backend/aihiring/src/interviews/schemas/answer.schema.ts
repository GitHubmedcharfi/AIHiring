import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AnswerDocument = Answer & Document;

@Schema({ timestamps: true })
export class Answer {
  @Prop({ type: Types.ObjectId, ref: 'Interview', required: true })
  interviewId: Types.ObjectId;

  @Prop({ required: true })
  question: string;

  @Prop({ required: true })
  answer: string;

  @Prop()
  score: number;

  @Prop()
  feedback: string;
}

export const AnswerSchema = SchemaFactory.createForClass(Answer);