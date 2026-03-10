import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type JobDocument = Job & Document;

@Schema({ timestamps: true })
export class Job {
  @Prop({ required: true, unique: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ default: 'draft', enum: ['draft', 'active'] })
  status: string;
}

export const JobSchema = SchemaFactory.createForClass(Job);