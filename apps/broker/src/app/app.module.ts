import { Module } from '@nestjs/common';

import {
  BrokerTransport,
  MqttBrokerModule,
} from '@kuiiksoft/shared/mqtt-broker';

import { ConfigModule, ConfigService } from '@kuiiksoft/core/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule,
    MqttBrokerModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const config = configService.getBrokerConfig();
        return {
          port: config.port,
          id: config.id,
          transport: config.transport as BrokerTransport,
          concurrency: config.concurrency,
          queueLimit: config.queueLimit,
          maxClientsIdLength: config.maxClientsIdLength,
          connectTimeout: config.connectTimeout,
          heartbeatInterval: config.heartbeatInterval,
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
