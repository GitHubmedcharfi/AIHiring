import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateJobDto {
  @ApiProperty({ description: 'Job title', example: 'DevOps Engineer' })
  readonly title: string;

  @ApiProperty({ description: 'Job description', example: 'Responsible for CI/CD pipelines and cloud infrastructure' })
  readonly description: string;

  @ApiPropertyOptional({ description: 'Job status', enum: ['draft', 'active'], example: 'active' })
  readonly status?: string | null;

  @ApiPropertyOptional({ description: 'Required skills for the job', example: ['AWS', 'Docker', 'Kubernetes'] })
  readonly skills?: string[];

  @ApiPropertyOptional({ description: 'Interview topics for AI question generation', example: ['devops', 'kubernetes', 'aws'] })
  readonly topics?: string[];
}