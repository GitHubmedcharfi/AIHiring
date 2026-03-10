export class UpdateJobDto {
  readonly title?: string;
  readonly description?: string;
  readonly status?: 'draft' | 'active';
}
