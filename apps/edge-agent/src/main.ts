import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { MqttClientService } from '@kuiiksoft/shared/mqtt-client';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const logger = new Logger('main');
  const appContext = await NestFactory.createApplicationContext(AppModule);

  const mqttClient = appContext.get(MqttClientService);

  const app = await NestFactory.createMicroservice(
    AppModule.setup({ transport: mqttClient }),
    { strategy: mqttClient, logger }
  );

  await app.listen();
  logger.log(
    `🚀 MQTT Edge Agent id '${mqttClient.getOptions().clientId}' is running.`
  );
}

bootstrap();
