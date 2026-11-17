import 'dotenv/config';
import { join } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule, ObserveInstrument } from './app.module.js';
import { TrimPipe } from './common/pipes/trim.pipe.js';
import { setupSwagger, SWAGGER_PATH } from './swagger.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    instrument: ObserveInstrument,
  });

  app.enableCors();
  app.useStaticAssets(join(process.cwd(), 'public'));
  app.useGlobalPipes(
    new TrimPipe(),
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  setupSwagger(app);

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  const logger = new Logger('Bootstrap');
  logger.log(`Swagger UI: http://localhost:${port}/${SWAGGER_PATH}`);
  logger.log(`Тестовий клієнт: http://localhost:${port}/client.html`);
}
await bootstrap();
