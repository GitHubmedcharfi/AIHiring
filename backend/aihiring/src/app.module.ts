import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JobsModule } from './jobs/jobs.module';
import { CandidatesModule } from './candidates/candidates.module';
import { InterviewsModule } from './interviews/interviews.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/ai-recruiter'),
    JobsModule,
    CandidatesModule,
    InterviewsModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
