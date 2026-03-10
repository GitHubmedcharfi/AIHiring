import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Candidate, CandidateDocument } from './schemas/candidate.schema';
import { CreateCandidateDto } from './dto/create-candidate.dto';

@Injectable()
export class CandidatesService {
  constructor(@InjectModel(Candidate.name) private candidateModel: Model<CandidateDocument>) {}

  async create(dto: CreateCandidateDto): Promise<Candidate> {
    const candidate = new this.candidateModel(dto);
    return candidate.save();
  }

  async findAll(): Promise<Candidate[]> {
    return this.candidateModel.find().exec();
  }

  async findOne(id: string): Promise<Candidate | null> {
    return this.candidateModel.findById(id).exec();
  }

  async update(id: string, dto: Partial<CreateCandidateDto>): Promise<Candidate | null> {
    return this.candidateModel.findByIdAndUpdate(id, dto, { new: true }).exec();
  }

  async remove(id: string): Promise<Candidate | null> {
    return this.candidateModel.findByIdAndDelete(id).exec();
  }
}