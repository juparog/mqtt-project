import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import {
  MQTTCLIENT_INSTANCE,
  MqttClientService,
} from '@kuiiksoft/shared/mqtt-client';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const logger = new Logger('main');
  const appContext = await NestFactory.createApplicationContext(AppModule);

  const mqttClient = appContext.get<MqttClientService>(MQTTCLIENT_INSTANCE);

  const app = await NestFactory.createMicroservice(
    AppModule.register({ mqttClient }),
    { strategy: mqttClient, logger }
  );

  await app.listen();
  logger.log(
    `🚀 MQTT Edge Agent id '${mqttClient.getOptions().clientId}' is running.`
  );
}

bootstrap();
