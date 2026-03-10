import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Candidate } from '../../candidates/schemas/candidate.schema';
import { Job } from '../../jobs/schemas/job.schema';

export type InterviewDocument = Interview & Document;

@Schema({ timestamps: true })
export class Interview {
  @Prop({ type: Types.ObjectId, ref: 'Candidate', required: true })
  candidateId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Job', required: true })
  jobId: Types.ObjectId;

  @Prop({ default: 'scheduled' })
  status: string;

  @Prop({ default: 0 })
  score: number;

  @Prop()
  duration: number; 
}

export const InterviewSchema = SchemaFactory.createForClass(Interview);