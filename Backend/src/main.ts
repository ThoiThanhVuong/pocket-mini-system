import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './infrastructure/common/filters/all-exceptions.filter';
import { DomainExceptionFilter } from './infrastructure/common/filters/domain-exception.filter';
import { TransformInterceptor } from './infrastructure/common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global exception filter
  app.useGlobalFilters(
    new AllExceptionsFilter(),
    new DomainExceptionFilter(),
  );

  // Global interceptor
  app.useGlobalInterceptors(
    new TransformInterceptor(),
  );

  // Enable CORS
  app.enableCors({
    origin: '*',
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
