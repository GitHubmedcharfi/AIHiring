import { Controller, Get, Post, Patch, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse, ApiBody } from '@nestjs/swagger';
import { InterviewsService } from './interviews.service';
import { CreateInterviewDto } from './dto/create-interview.dto';

@ApiTags('Interviews')
@Controller('interviews')
export class InterviewsController {
  constructor(private readonly interviewsService: InterviewsService) {}

  @Post()
  @ApiOperation({ summary: 'Schedule an interview', description: 'Create a new interview for a candidate' })
  @ApiResponse({ status: 201, description: 'Interview scheduled successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiBody({
    schema: {
      properties: {
        candidateName: { type: 'string', example: 'John Doe', description: 'Candidate name' },
        interviewerName: { type: 'string', example: 'Jane Doe', description: 'Interviewer name' },
        interviewDate: { type: 'string', example: '2023-03-01T14:00:00.000Z', description: 'Interview date and time' },
        topic: { type: 'string', example: 'devops', description: 'Interview topic' },
      },
    },
  })
  create(@Body() dto: CreateInterviewDto) {
    return this.interviewsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all interviews', description: 'Retrieve a list of all scheduled interviews' })
  @ApiResponse({ status: 200, description: 'Interviews retrieved successfully' })
  findAll() {
    return this.interviewsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get interview by ID', description: 'Retrieve a specific interview by ID' })
  @ApiParam({ name: 'id', description: 'Interview ID', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({ status: 200, description: 'Interview found' })
  @ApiResponse({ status: 404, description: 'Interview not found' })
  findOne(@Param('id') id: string) {
    return this.interviewsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update interview', description: 'Update an existing interview' })
  @ApiParam({ name: 'id', description: 'Interview ID', example: '507f1f77bcf86cd799439011' })
  @ApiBody({ type: CreateInterviewDto })
  @ApiResponse({ status: 200, description: 'Interview updated successfully' })
  @ApiResponse({ status: 404, description: 'Interview not found' })
  update(@Param('id') id: string, @Body() dto: CreateInterviewDto) {
    return this.interviewsService.update(id, {
      ...dto,
      interviewDate: dto.interviewDate ? new Date(dto.interviewDate) : undefined,
    } as any);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update interview status', description: 'Change the status of an interview (scheduled, in_progress, completed)' })
  @ApiParam({ name: 'id', description: 'Interview ID', example: '507f1f77bcf86cd799439011' })
  @ApiBody({ schema: { properties: { status: { type: 'string', example: 'completed' } } } })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  @ApiResponse({ status: 404, description: 'Interview not found' })
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.interviewsService.updateStatus(id, status);
  }

  @Post(':id/answers')
  @ApiOperation({ summary: 'Add answer to interview', description: 'Record a candidate answer with optional score and feedback' })
  @ApiParam({ name: 'id', description: 'Interview ID', example: '507f1f77bcf86cd799439011' })
  @ApiBody({
    schema: {
      properties: {
        question: { type: 'string', example: 'What is Docker?' },
        transcription: { type: 'string', example: 'Docker is a containerization platform...' },
        score: { type: 'number', example: 85 },
        feedback: { type: 'string', example: 'Good understanding of containerization concepts' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Answer recorded successfully' })
  addAnswer(@Param('id') id: string, @Body() body: { question: string; transcription: string; score?: number; feedback?: string }) {
    return this.interviewsService.addAnswer(id, body.question, body.transcription, body.score, body.feedback);
  }

  @Get(':id/answers')
  @ApiOperation({ summary: 'Get all answers for interview', description: 'Retrieve all recorded answers for a specific interview' })
  @ApiParam({ name: 'id', description: 'Interview ID', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({ status: 200, description: 'Answers retrieved successfully' })
  getAnswers(@Param('id') id: string) {
    return this.interviewsService.getAnswers(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete interview', description: 'Delete a specific interview by ID' })
  @ApiParam({ name: 'id', description: 'Interview ID', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({ status: 200, description: 'Interview deleted successfully' })
  @ApiResponse({ status: 404, description: 'Interview not found' })
  remove(@Param('id') id: string) {
    return this.interviewsService.remove(id);
  }
}
