import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Interview, InterviewDocument } from './schemas/interview.schema';
import { Answer, AnswerDocument } from './schemas/answer.schema';
import { CreateInterviewDto } from './dto/create-interview.dto';

@Injectable()
export class InterviewsService {
  constructor(
    @InjectModel(Interview.name) private interviewModel: Model<InterviewDocument>,
    @InjectModel(Answer.name) private answerModel: Model<AnswerDocument>,
  ) {}

  async create(dto: CreateInterviewDto): Promise<Interview> {
    const interview = new this.interviewModel({ ...dto, status: 'scheduled', score: 0 });
    return interview.save();
  }

  async findAll(): Promise<Interview[]> {
    return this.interviewModel.find().exec();
  }

  async findOne(id: string): Promise<Interview | null> {
    return this.interviewModel.findById(id).exec();
  }

  async updateStatus(id: string, status: string): Promise<Interview | null> {
    return this.interviewModel.findByIdAndUpdate(id, { status }, { new: true }).exec();
  }

  async addAnswer(interviewId: string, question: string, transcription: string, score?: number, feedback?: string) {
    const answer = new this.answerModel({ interviewId, question, transcription, score, feedback });
    return answer.save();
  }

  async getAnswers(interviewId: string): Promise<Answer[]> {
    return this.answerModel.find({ interviewId }).exec();
  }
}
