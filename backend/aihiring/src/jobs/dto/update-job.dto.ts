import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateJobDto {
  @ApiPropertyOptional({ description: 'Job title', example: 'Senior DevOps Engineer' })
  readonly title?: string;

  @ApiPropertyOptional({ description: 'Job description', example: 'Updated job description' })
  readonly description?: string;

  @ApiPropertyOptional({ description: 'Job status', enum: ['draft', 'active'], example: 'active' })
  readonly status?: 'draft' | 'active';
}
