import {
  InjectionToken,
  ModuleMetadata,
  OptionalFactoryDependency,
  Type,
} from '@nestjs/common';
import { MqttOptions } from '@nestjs/microservices';

export type MqttClientModuleOptions = MqttOptions['options'] & {
  reconnectRetries?: boolean | number;
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
