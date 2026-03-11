import { ApiProperty } from '@nestjs/swagger';

export class CreateCandidateDto {
  @ApiProperty({ description: 'Candidate full name', example: 'John Doe' })
  readonly name: string;

  @ApiProperty({ description: 'Candidate email address', example: 'john.doe@example.com' })
  readonly email: string;

  @ApiProperty({ description: 'Job ID the candidate is applying for', example: '507f1f77bcf86cd799439011' })
  readonly jobId: string;
}