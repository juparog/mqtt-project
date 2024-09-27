import { Logger, Provider, Type } from '@nestjs/common';
import { createBroker } from 'aedes';
import { createServer } from 'aedes-server-factory';

import {
  BrokerTransport,
  LOGGER_KEY,
  MQTTBROKER_INSTANCE,
  MQTTBROKER_LOGGER_PROVIDER,
  MQTTBROKER_OPTION_MODULE,
} from './mqtt-broker.constants';
import {
  MqttBrokerModuleAsyncOptions,
  MqttBrokerModuleOptions,
  MqttBrokerOptionsFactory,
} from './mqtt-broker.interfaces';

export function createLoggerProvider(): Provider {
  Logger.debug('Creating Logger Provider', LOGGER_KEY);
  return {
    provide: MQTTBROKER_LOGGER_PROVIDER,
    useValue: new Logger('MqttBrokerModule'),
  };
}

export function createBrokerProvider(): Provider {
  return {
    provide: MQTTBROKER_INSTANCE,
    useFactory: async (options: MqttBrokerModuleOptions) => {
      Logger.debug('Creating Broker Instance', LOGGER_KEY);
      if (!options.transport) {
        Logger.debug('Setting Default Transport For Mqtt < TCP >', LOGGER_KEY);
        options.transport = BrokerTransport.TCP;
      }
      // Create a new instance of Aedes broker
      const broker = createBroker(options);

      // Simple plain MQTT server using server-factory
      if (options.transport == BrokerTransport.TCP) {
        createServer(broker).listen(options.port);
        Logger.debug(
          `Creating TCP Server on Port ${options.port}...`,
          LOGGER_KEY
        );
      }

      // MQTT server over WebSocket using server-factory
      if (options.transport == BrokerTransport.WS) {
        createServer(broker, { ws: true }).listen(options.port);
        Logger.debug(
          `Creating WS Server on Port ${options.port}...`,
          LOGGER_KEY
        );
      }

      Logger.log(`Broker Instance Created on Port ${options.port}`, LOGGER_KEY);
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
