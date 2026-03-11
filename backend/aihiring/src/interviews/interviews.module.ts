import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InterviewsController } from './interviews.controller';
import { InterviewsService } from './interviews.service';
import { Interview, InterviewSchema } from './schemas/interview.schema';
import { Answer, AnswerSchema } from './schemas/answer.schema';
import { InterviewGateway } from './interview.gateway';
import { AiModule } from '../ai/ai.module';
import { JobsModule } from '../jobs/jobs.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Interview.name, schema: InterviewSchema },
      { name: Answer.name, schema: AnswerSchema },
    ]),
    AiModule,
    JobsModule,
  ],
  controllers: [InterviewsController],
  providers: [InterviewsService, InterviewGateway],
  exports: [InterviewsService],
})
export class InterviewsModule {}
