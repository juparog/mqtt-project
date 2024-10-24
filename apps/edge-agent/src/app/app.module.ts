import { ConfigModule, ConfigService } from '@kuiiksoft/core/config';
import {
  MqttClientModule,
  MqttClientService,
} from '@kuiiksoft/shared/mqtt-client';
import { DynamicModule, Global, Module } from '@nestjs/common';
import { QoS } from '@nestjs/microservices/external/mqtt-options.interface';
import { DeviceModule } from '../device';
import { MQTT_TRANSPORT } from './app.constants';

@Global()
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
  static setup(options: { mqttClient: MqttClientService }): DynamicModule {
    const transport = {
      provide: MQTT_TRANSPORT,
      useValue: options.mqttClient,
    };
    return {
      module: AppModule,
      imports: [DeviceModule],
      providers: [transport],
      exports: [transport],
    };
  }
}
