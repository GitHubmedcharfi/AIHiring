import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInterviewDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Candidate name', example: 'John Doe' })
  readonly candidateName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Interviewer name', example: 'Jane Doe' })
  readonly interviewerName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Interview date and time', example: '2023-03-01T14:00:00.000Z' })
  readonly interviewDate: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Interview topic', example: 'devops' })
  readonly topic: string;
}