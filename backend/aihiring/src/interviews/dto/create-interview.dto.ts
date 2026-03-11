import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInterviewDto {
  @IsString()
  @ApiProperty({ description: 'Candidate ID', example: '507f1f77bcf86cd799439011' })
  readonly candidateId: string;

  @IsString()
  @ApiProperty({ description: 'Job ID', example: '507f1f77bcf86cd799439022' })
  readonly jobId: string;
}