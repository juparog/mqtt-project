import { DynamicModule, Global, Module } from '@nestjs/common';
import {
  MQTTCLIENT_INSTANCE,
  MQTTCLIENT_OPTION_MODULE,
} from './mqtt-client.constants';
import {
  MqttClientModuleAsyncOptions,
  MqttClientModuleOptions,
} from './mqtt-client.interfaces';
import { createAsyncProviders } from './mqtt-client.providers';
import { MqttClientService } from './mqtt-client.service';

@Global()
@Module({
  providers: [{ provide: MQTTCLIENT_INSTANCE, useClass: MqttClientService }],
  exports: [{ provide: MQTTCLIENT_INSTANCE, useClass: MqttClientService }],
})
export class MqttClientModule {
  static forRoot(options: MqttClientModuleOptions): DynamicModule {
    return {
      module: MqttClientModule,
      providers: [
        {
          provide: MQTTCLIENT_OPTION_MODULE,
          useValue: options,
        },
      ],
    };
  }

  static forRootAsync(options: MqttClientModuleAsyncOptions): DynamicModule {
    return {
      module: MqttClientModule,
      providers: [...createAsyncProviders(options)],
    };
  }
}
