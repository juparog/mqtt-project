import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { ConfigService } from '@kuiiksoft/core/config';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService).getApiConfig();
  const globalPrefix = config.globalPrefix;
  app.setGlobalPrefix(globalPrefix);
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );
  const configSwagger = new DocumentBuilder()
    .setTitle('Mqtt Project')
    .setDescription('Api rest for mqtt project, by: @kuiiksoft')
    .setVersion('v1')
    .build();
  const document = SwaggerModule.createDocument(app, configSwagger);
  SwaggerModule.setup(globalPrefix, app, document);
  const port = config.port;
  const host = config.host;
  await app.listen(port, host);
  Logger.log(
    `🚀 Application is running on: http://${host}:${port}/${globalPrefix}`
  );
}

bootstrap();
