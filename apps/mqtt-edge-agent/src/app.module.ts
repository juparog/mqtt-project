import { DynamicModule, Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ServerMqtt } from '@nestjs/microservices';
import { QoS } from '@nestjs/microservices/external/mqtt-options.interface';

import { ConfigModule, ConfigService } from '@kuiiksoft/config';

import { MQTT_TRANSPORT } from './app.constants';
import { SerialInterfaceController } from './controllers';
import { MqttCustomStrategy } from './mqtt.strategy';
import { InterfaceManagerService } from './services';

@Module({
  imports: [ConfigModule, EventEmitterModule.forRoot()],
  controllers: [SerialInterfaceController],
  providers: [
    {
      provide: MQTT_TRANSPORT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const config = configService.getConfig();
        return new MqttCustomStrategy({
          url: config.edgeAgent.broker.url,
          clientId: config.edgeAgent.client.id,
          username: config.edgeAgent.client.id,
          password: config.edgeAgent.client.token,
          subscribeOptions: {
            qos: config.edgeAgent.client.qos as QoS,
          },
        });
      },
    },
    InterfaceManagerService,
  ],
})
export class AppModule {
  static register(options: { mqttTransport: ServerMqtt }): DynamicModule {
    return {
      module: AppModule,
      providers: [
        {
          provide: MQTT_TRANSPORT,
          useValue: options.mqttTransport,
        },
      ],
    };
  }
}
