import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors({ origin: 'http://localhost:4200', credentials: true });

  await app.listen(process.env.PORT ?? 3000);
  console.log(`EMA Backend running on http://localhost:3000/api`);
}
bootstrap();
