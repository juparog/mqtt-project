import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';

import { MQTT_TRANSPORT } from './app.constants';
import { AppModule } from './app.module';
import { MqttCustomStrategy } from './mqtt.strategy';

async function bootstrap() {
  const logger = new Logger('main');
  const appContext = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });

  const mqttTransport = appContext.get<MqttCustomStrategy>(MQTT_TRANSPORT);

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule.register({ mqttTransport }),
    { strategy: mqttTransport, logger }
  );

  await app.listen();
  logger.log(
    `🚀 MQTT Edge Agent '${mqttTransport.getOptions().clientId}' is running.`
  );
}

bootstrap();
