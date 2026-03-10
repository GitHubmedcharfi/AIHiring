import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Job, JobDocument } from './schemas/job.schema';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

@Injectable()
export class JobsService {
  constructor(@InjectModel(Job.name) private jobModel: Model<JobDocument>) {}

  async create(createJobDto: CreateJobDto): Promise<Job> {
    if (!createJobDto.title?.trim()) {
      throw new BadRequestException('Title is required and cannot be empty');
    }
    if (!createJobDto.description?.trim()) {
      throw new BadRequestException('Description is required and cannot be empty');
    }
    const status = createJobDto.status || 'draft';
    if (status !== 'draft' && status !== 'active') {
      throw new BadRequestException('Status must be either "draft" or "active"');
    }

    const existing = await this.jobModel.findOne({ title: createJobDto.title }).exec();
    if (existing) {
      throw new ConflictException('Job with this title already exists');
    }

    const job = new this.jobModel({ ...createJobDto, status });
    return job.save();
  }

  async findAll(): Promise<Job[]> {
    return this.jobModel.find().exec();
  }

  async findOne(id: string): Promise<Job | null> {
    return this.jobModel.findById(id).exec();
  }

  async update(id: string, updateJobDto: UpdateJobDto): Promise<Job | null> {
    if (updateJobDto.title === '' || updateJobDto.description === '') {
      throw new BadRequestException('Title and description cannot be empty');
    }
    if (!updateJobDto.title && !updateJobDto.description && !updateJobDto.status) {
      throw new BadRequestException('At least one field (title, description, or status) must be provided');
    }
    if (updateJobDto.status && updateJobDto.status !== 'draft' && updateJobDto.status !== 'active') {
      throw new BadRequestException('Status must be either "draft" or "active"');
    }

    if (updateJobDto.title) {
      const existing = await this.jobModel.findOne({ title: updateJobDto.title, _id: { $ne: id } }).exec();
      if (existing) {
        throw new ConflictException('Job with this title already exists');
      }
    }

    return this.jobModel.findByIdAndUpdate(id, updateJobDto, { new: true }).exec();
  }

  async remove(id: string): Promise<Job | null> {
    return this.jobModel.findByIdAndDelete(id).exec();
  }
}