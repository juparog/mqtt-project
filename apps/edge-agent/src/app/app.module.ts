import { DynamicModule, Module } from '@nestjs/common';
import { QoS } from '@nestjs/microservices/external/mqtt-options.interface';

import { ConfigModule, ConfigService } from '@kuiiksoft/core/config';

import {
  MqttClientModule,
  MqttClientService,
} from '@kuiiksoft/shared/mqtt-client';
import { InterfaceModule } from '../interface';

@Module({
  imports: [
    ConfigModule,
    MqttClientModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const config = configService.getEdgeAgentConfig();
        return {
          url: config.broker.url,
          clientId: config.client.id,
          username: config.client.id,
          password: config.client.token,
          subscribeOptions: {
            qos: config.client.qos as QoS,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {
  static register(options: { mqttClient: MqttClientService }): DynamicModule {
    return {
      module: AppModule,
      imports: [InterfaceModule.register({ mqttClient: options.mqttClient })],
    };
  }
}
