import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Job } from '../../jobs/schemas/job.schema';

export type CandidateDocument = Candidate & Document;

@Schema({ timestamps: true })
export class Candidate {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ type: Types.ObjectId, ref: 'Job', required: true })
  jobId: Types.ObjectId; 
}

export const CandidateSchema = SchemaFactory.createForClass(Candidate);