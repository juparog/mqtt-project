import {
  InjectionToken,
  LoggerService,
  ModuleMetadata,
  OptionalFactoryDependency,
  Type,
} from '@nestjs/common';
import { MqttOptions } from '@nestjs/microservices';

export type MqttClientModuleOptions = MqttOptions['options'];

export interface MqttClientOptionsFactory {
  createMqttClientConnectOptions():
    | Promise<MqttClientModuleOptions>
    | MqttClientModuleOptions;
}

export interface MqttClientLoggerOptions {
  useValue?: LoggerService;
  useClass?: Type<LoggerService>;
}

export interface MqttClientModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  inject?: (InjectionToken | OptionalFactoryDependency)[];
  useExisting?: Type<MqttClientOptionsFactory>;
  useClass?: Type<MqttClientOptionsFactory>;
  useFactory?: (
    ...args: unknown[]
  ) => Promise<MqttClientModuleOptions> | MqttClientModuleOptions;
  logger?: MqttClientLoggerOptions;
}
