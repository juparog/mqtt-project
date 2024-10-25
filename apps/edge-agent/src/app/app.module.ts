import { ConfigModule, ConfigService } from '@kuiiksoft/core/config';
import { MqttClientModule } from '@kuiiksoft/shared/mqtt-client';
import { DynamicModule, Global, Module } from '@nestjs/common';
import { QoS } from '@nestjs/microservices/external/mqtt-options.interface';
import { DeviceModule } from '../device';
import { MQTT_TRANSPORT } from './app.constants';
import { IMqttTransport } from './app.interfaces';

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
  static setup(options: { transport: IMqttTransport }): DynamicModule {
    const transport = {
      provide: MQTT_TRANSPORT,
      useValue: options.transport,
    };
    return {
      module: AppModule,
      imports: [DeviceModule],
      providers: [transport],
      exports: [transport],
    };
  }
}
