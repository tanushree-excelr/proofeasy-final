import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('ProofEasy MST API')
    .setDescription('ProofEasy Blockchain Integration APIs')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(
    app,
    config,
  );

  SwaggerModule.setup(
    'swagger',
    app,
    document,
  );

  await app.listen(3000);

  console.log(
    'Server Running: http://localhost:3000',
  );
  console.log(
    'Swagger: http://localhost:3000/swagger',
  );
}

bootstrap();