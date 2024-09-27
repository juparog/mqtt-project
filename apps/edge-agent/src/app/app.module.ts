import { DynamicModule, Module } from '@nestjs/common';
import { QoS } from '@nestjs/microservices/external/mqtt-options.interface';

import { ConfigModule, ConfigService } from '@kuiiksoft/config';

import { MqttClientModule, MqttClientService } from '@kuiiksoft/mqtt-client';
import { InterfaceModule } from '../interface';

@Module({
  imports: [
    ConfigModule,
    MqttClientModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const config = configService.getConfig();
        return {
          url: config.edgeAgent.broker.url,
          clientId: config.edgeAgent.client.id,
          username: config.edgeAgent.client.id,
          password: config.edgeAgent.client.token,
          subscribeOptions: {
            qos: config.edgeAgent.client.qos as QoS,
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
      imports: [
        // MqttClientModule.register({
        //   mqttClient: options.mqttClient,
        // }),
        InterfaceModule.forRoot({ mqttClient: options.mqttClient }),
      ],
    };
  }
}
