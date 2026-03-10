import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { InterviewsService } from './interviews.service';
import { CreateInterviewDto } from './dto/create-interview.dto';

@Controller('interviews')
export class InterviewsController {
  constructor(private readonly interviewsService: InterviewsService) {}

  @Post()
  create(@Body() dto: CreateInterviewDto) {
    return this.interviewsService.create(dto);
  }

  @Get()
  findAll() {
    return this.interviewsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.interviewsService.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.interviewsService.updateStatus(id, status);
  }

  @Post(':id/answers')
  addAnswer(@Param('id') id: string, @Body() body: { question: string; transcription: string; score?: number; feedback?: string }) {
    return this.interviewsService.addAnswer(id, body.question, body.transcription, body.score, body.feedback);
  }

  @Get(':id/answers')
  getAnswers(@Param('id') id: string) {
    return this.interviewsService.getAnswers(id);
  }
}
