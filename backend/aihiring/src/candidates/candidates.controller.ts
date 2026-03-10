import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { CandidatesService } from './candidates.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';

@Controller('candidates')
export class CandidatesController {
  constructor(private readonly candidatesService: CandidatesService) {}

  @Post()
  create(@Body() dto: CreateCandidateDto) {
    return this.candidatesService.create(dto);
  }

  @Get()
  findAll() {
    return this.candidatesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.candidatesService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateCandidateDto>) {
    return this.candidatesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.candidatesService.remove(id);
  }
}