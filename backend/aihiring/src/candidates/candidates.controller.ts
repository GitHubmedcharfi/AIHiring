import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CandidatesService } from './candidates.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';

@ApiTags('Candidates')
@Controller('candidates')
export class CandidatesController {
  constructor(private readonly candidatesService: CandidatesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new candidate', description: 'Register a candidate for a job position' })
  @ApiResponse({ status: 201, description: 'Candidate created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  create(@Body() dto: CreateCandidateDto) {
    return this.candidatesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all candidates', description: 'Retrieve a list of all candidates' })
  @ApiResponse({ status: 200, description: 'Candidates retrieved successfully' })
  findAll() {
    return this.candidatesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get candidate by ID', description: 'Retrieve a specific candidate by ID' })
  @ApiParam({ name: 'id', description: 'Candidate ID', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({ status: 200, description: 'Candidate found' })
  @ApiResponse({ status: 404, description: 'Candidate not found' })
  findOne(@Param('id') id: string) {
    return this.candidatesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update candidate', description: 'Update candidate information' })
  @ApiParam({ name: 'id', description: 'Candidate ID', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({ status: 200, description: 'Candidate updated successfully' })
  @ApiResponse({ status: 404, description: 'Candidate not found' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateCandidateDto>) {
    return this.candidatesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete candidate', description: 'Remove a candidate from the system' })
  @ApiParam({ name: 'id', description: 'Candidate ID', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({ status: 200, description: 'Candidate deleted successfully' })
  @ApiResponse({ status: 404, description: 'Candidate not found' })
  remove(@Param('id') id: string) {
    return this.candidatesService.remove(id);
  }
}