import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const config = new DocumentBuilder()
    .setTitle('AI Hiring Platform API')
    .setDescription('API for AI-powered interview platform with LLM, TTS, and STT capabilities')
    .setVersion('1.0')
    .addTag('Jobs', 'Job management endpoints')
    .addTag('Candidates', 'Candidate management endpoints')
    .addTag('Interviews', 'Interview scheduling and management')
    .addTag('AI', 'AI services - LLM, TTS, STT, Evaluation')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  
  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application running on: http://localhost:${process.env.PORT ?? 3000}`);
  console.log(`Swagger docs available at: http://localhost:${process.env.PORT ?? 3000}/api/docs`);
}
bootstrap();
