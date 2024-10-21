import {
  InjectionToken,
  LoggerService,
  ModuleMetadata,
  OptionalFactoryDependency,
  Type,
} from '@nestjs/common';
import { MqttOptions } from '@nestjs/microservices';

export interface MqttClientLoggerOptions {
  useValue?: LoggerService;
  useClass?: Type<LoggerService>;
}

export type MqttClientModuleOptions = MqttOptions['options'] & {
  logger?: MqttClientLoggerOptions;
};

export interface MqttClientOptionsFactory {
  createMqttClientConnectOptions():
    | Promise<MqttClientModuleOptions>
    | MqttClientModuleOptions;
}

export interface MqttClientModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  inject?: (InjectionToken | OptionalFactoryDependency)[];
  useExisting?: MqttClientOptionsFactory;
  useClass?: Type<MqttClientOptionsFactory>;
  useFactory?: (
    ...args: unknown[]
  ) => Promise<MqttClientModuleOptions> | MqttClientModuleOptions;
}
