import { ConfigModule, ConfigService } from '@kuiiksoft/core/config';
import {
  BrokerTransport,
  MqttBrokerModule,
} from '@kuiiksoft/shared/mqtt-broker';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule,
    MqttBrokerModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const config = configService.getBrokerConfig();
        const wsConfig = config.port.ws ? { port: config.port.ws } : undefined;
        return {
          id: config.id,
          mqtt: {
            port: config.port.mqtt,
          },
          ws: wsConfig,
          hostname: config.hostname,
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
    HttpModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
