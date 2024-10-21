import {
  InjectionToken,
  ModuleMetadata,
  OptionalFactoryDependency,
  Type,
} from '@nestjs/common';
import { AedesOptions, PublishPacket } from 'aedes';
import { BrokerTransport } from './mqtt-broker.constants';

export interface MqttBrokerModuleOptions extends AedesOptions {
  port: number;
  transport?: BrokerTransport;
}

export interface MqttBrokerOptionsFactory {
  createMqttBrokerConnectOptions():
    | Promise<MqttBrokerModuleOptions>
    | MqttBrokerModuleOptions;
}

export interface MqttBrokerModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  inject?: (InjectionToken | OptionalFactoryDependency)[];
  useExisting?: Type<MqttBrokerOptionsFactory>;
  useClass?: Type<MqttBrokerOptionsFactory>;
  useFactory?: (
    ...args: unknown[]
  ) => Promise<MqttBrokerModuleOptions> | MqttBrokerModuleOptions;
}

export interface PubPacket extends PublishPacket {
  cmd: 'publish';
  qos: 0 | 1 | 2;
  topic: string;
  payload: string | Buffer;
}

export type MqttMessageTransformer<T> = (payload: string | Buffer) => T;

export interface MqttSubscribeOptions {
  topic: string | string[];
  queue?: boolean;
  share?: string;
  transform?: 'json' | 'text' | MqttMessageTransformer<unknown>;
}

export interface MqttSubscriberParameter {
  index: number;
  type:
    | 'error'
    | 'payload'
    | 'topic'
    | 'publish'
    | 'packet'
    | 'client'
    | 'host'
    | 'subscription'
    | 'subscriptions'
    | 'unsubscription'
    | 'function'
    | 'credential';
  transform?: 'json' | 'text' | MqttMessageTransformer<unknown>;
}

export interface DiscoveredClass<T = object> {
  name: string;
  instance: T;
}

export interface DiscoveredMethod {
  handler: (...args: unknown[]) => unknown;
  methodName: string;
  parentClass: DiscoveredClass;
}

export interface DiscoveredMethodWithMeta {
  discoveredMethod: DiscoveredMethod;
  meta: string;
}

export interface Host {
  id: string;
  connectedClients: number;
  closed: boolean;
}