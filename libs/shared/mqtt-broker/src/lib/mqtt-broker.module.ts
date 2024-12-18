import { DynamicModule, Global, Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';

import { MQTTBROKER_OPTION_MODULE } from './mqtt-broker.constants';
import { MqttBrokerDiscovery } from './mqtt-broker.discovery';
import {
  MqttBrokerModuleAsyncOptions,
  MqttBrokerModuleOptions,
} from './mqtt-broker.interfaces';
import {
  createAsyncProviders,
  createBrokerProvider,
} from './mqtt-broker.providers';
import { MqttBrokerResolver } from './mqtt-broker.resolver';
import { MqttBrokerService } from './mqtt-broker.service';

@Global()
@Module({
  imports: [DiscoveryModule],
  providers: [MqttBrokerDiscovery, MqttBrokerResolver, MqttBrokerService],
  exports: [MqttBrokerService],
})
export class MqttBrokerModule {
  static forRoot(options: MqttBrokerModuleOptions): DynamicModule {
    return {
      module: MqttBrokerModule,
      providers: [
        {
          provide: MQTTBROKER_OPTION_MODULE,
          useValue: options,
        },
        createBrokerProvider(),
      ],
    };
  }

  public static forRootAsync(
    options: MqttBrokerModuleAsyncOptions
  ): DynamicModule {
    return {
      module: MqttBrokerModule,
      providers: [...createAsyncProviders(options), createBrokerProvider()],
    };
  }
}
