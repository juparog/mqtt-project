import { Logger, Provider, Type } from '@nestjs/common';
import { createBroker } from 'aedes';
import { createServer } from 'aedes-server-factory';

import {
  LOGGER_KEY,
  MQTTBROKER_INSTANCE,
  MQTTBROKER_OPTION_MODULE,
} from './mqtt-broker.constants';
import {
  MqttBrokerModuleAsyncOptions,
  MqttBrokerModuleOptions,
  MqttBrokerOptionsFactory,
} from './mqtt-broker.interfaces';

export function createBrokerProvider(): Provider {
  return {
    provide: MQTTBROKER_INSTANCE,
    useFactory: async (options: MqttBrokerModuleOptions) => {
      Logger.debug('Creating Broker Instance', LOGGER_KEY);

      const broker = createBroker(options);
      const hostname = options.hostname || 'localhost';

      const mqttPort = options.mqtt.port;
      const mqttServer = createServer(broker);
      mqttServer.listen(mqttPort, hostname, () => {
        Logger.log(
          `MQTT Server running on: mqtt://${hostname}:${mqttPort}`,
          LOGGER_KEY
        );
      });

      if (options.ws) {
        const wsPort = options.ws.port;
        const wsServer = createServer(broker, { ws: true });
        wsServer.listen(wsPort, () => {
          Logger.log(
            `WebSocket Server running on: ws://${hostname}:${wsPort}`,
            LOGGER_KEY
          );
        });
      }

      Logger.log(`Broker Instance Created`, LOGGER_KEY);
      return broker;
    },
    inject: [MQTTBROKER_OPTION_MODULE],
  };
}

export function createAsyncOptionsProvider(
  options: MqttBrokerModuleAsyncOptions
): Provider {
  if (options.useFactory) {
    return {
      provide: MQTTBROKER_OPTION_MODULE,
      useFactory: options.useFactory,
      inject: options.inject || [],
    };
  }
  const inject = [
    (options.useClass || options.useExisting) as Type<MqttBrokerOptionsFactory>,
  ];
  return {
    provide: MQTTBROKER_OPTION_MODULE,
    useFactory: async (optionsFactory: MqttBrokerOptionsFactory) =>
      await optionsFactory.createMqttBrokerConnectOptions(),
    inject,
  };
}

export function createAsyncProviders(
  options: MqttBrokerModuleAsyncOptions
): Provider[] {
  if (options.useExisting || options.useFactory) {
    return [createAsyncOptionsProvider(options)];
  }
  const useClass = options.useClass as Type<MqttBrokerOptionsFactory>;
  return [
    createAsyncOptionsProvider(options),
    {
      provide: useClass,
      useClass,
    },
  ];
}
