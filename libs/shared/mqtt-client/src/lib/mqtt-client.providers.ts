import { Provider, Type } from '@nestjs/common';

import { MQTTCLIENT_OPTION_MODULE } from './mqtt-client.constants';
import {
  MqttClientModuleAsyncOptions,
  MqttClientOptionsFactory,
} from './mqtt-client.options';

export function createAsyncOptionsProvider(
  options: MqttClientModuleAsyncOptions
): Provider {
  if (options.useFactory) {
    return {
      provide: MQTTCLIENT_OPTION_MODULE,
      useFactory: options.useFactory,
      inject: options.inject || [],
    };
  }
  const inject = [
    (options.useClass || options.useExisting) as Type<MqttClientOptionsFactory>,
  ];
  return {
    provide: MQTTCLIENT_OPTION_MODULE,
    useFactory: async (optionsFactory: MqttClientOptionsFactory) =>
      await optionsFactory.createMqttClientConnectOptions(),
    inject,
  };
}

export function createAsyncProviders(
  options: MqttClientModuleAsyncOptions
): Provider[] {
  if (options.useExisting || options.useFactory) {
    return [createAsyncOptionsProvider(options)];
  }
  const useClass = options.useClass as Type<MqttClientOptionsFactory>;
  return [
    createAsyncOptionsProvider(options),
    {
      provide: useClass,
      useClass,
    },
  ];
}
