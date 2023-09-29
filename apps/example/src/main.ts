import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 9999;
  await app.listen(port);
  Logger.log(`🚀 Application is running on: ${await app.getUrl()}`);
}

bootstrap();
