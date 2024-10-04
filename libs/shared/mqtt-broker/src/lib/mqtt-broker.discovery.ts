import { Injectable, Scope } from '@nestjs/common';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import { STATIC_CONTEXT } from '@nestjs/core/injector/constants';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import {
  KEY_SUBSCRIBE_OPTIONS,
  KEY_SUBSCRIBER_PARAMS,
} from './mqtt-broker.constants';
import {
  DiscoveredClass,
  DiscoveredMethodWithMeta,
  MqttSubscriberParameter,
} from './mqtt-broker.interfaces';

@Injectable()
export class MqttBrokerDiscovery {
  private readonly reflector = new Reflector();

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner
  ) {}

  getNonRequestScopedProviders() {
    return this.discoveryService
      .getProviders()
      .filter((provider) => provider.scope !== Scope.REQUEST);
  }

  async discoverClasses(
    providers: InstanceWrapper[]
  ): Promise<DiscoveredClass[]> {
    return Promise.all(
      providers.map((provider) => this.toDiscoveredClass(provider))
    );
  }

  discoverMethods(
    discoveredClasses: DiscoveredClass[]
  ): DiscoveredMethodWithMeta[] {
    return discoveredClasses.flatMap((discoverClass) =>
      this.classMethodsWithMetaAtKey(KEY_SUBSCRIBE_OPTIONS, discoverClass)
    );
  }

  addMethodParameters(
    discoveredMethods: DiscoveredMethodWithMeta[]
  ): (DiscoveredMethodWithMeta & { params: MqttSubscriberParameter[] })[] {
    return discoveredMethods.map((discoveredMethod) => ({
      ...discoveredMethod,
      params: this.getMethodParameters(discoveredMethod),
    }));
  }

  private async toDiscoveredClass(
    wrapper: InstanceWrapper
  ): Promise<DiscoveredClass> {
    const instanceHost = wrapper.getInstanceByContextId(
      STATIC_CONTEXT,
      wrapper && wrapper.id ? wrapper.id : undefined
    );

    if (instanceHost.isPending && !instanceHost.isResolved) {
      await instanceHost.donePromise;
    }

    return {
      name: wrapper.name as string,
      instance: instanceHost.instance,
    };
  }

  private classMethodsWithMetaAtKey(
    metaKey: string,
    discoverClass: DiscoveredClass
  ): DiscoveredMethodWithMeta[] {
    const { instance } = discoverClass;

    if (!instance) {
      return [];
    }

    const prototype = Object.getPrototypeOf(instance);

    return this.metadataScanner
      .getAllMethodNames(prototype)
      .map((name) =>
        this.extractMethodMetaAtKey(metaKey, discoverClass, prototype, name)
      )
      .filter((x) => x.meta !== null && x.meta !== undefined);
  }

  private extractMethodMetaAtKey(
    metaKey: string,
    discoveredClass: DiscoveredClass,
    prototype: { [key: string]: object },
    methodName: string
  ): DiscoveredMethodWithMeta {
    const handler = prototype[methodName];
    const meta = Reflect.getMetadata(metaKey, handler);

    return {
      meta,
      discoveredMethod: {
        handler: handler as (...args: unknown[]) => unknown,
        methodName,
        parentClass: discoveredClass,
      },
    };
  }

  private getMethodParameters(
    subscriber: DiscoveredMethodWithMeta
  ): MqttSubscriberParameter[] {
    const parameters = this.reflector.get<MqttSubscriberParameter[]>(
      KEY_SUBSCRIBER_PARAMS,
      subscriber.discoveredMethod.handler
    );

    if (!Array.isArray(parameters)) {
      return [];
    }

    const orderedParameters: MqttSubscriberParameter[] = [];
    parameters.forEach((parameter) => {
      orderedParameters[parameter.index] = parameter;
    });
    return orderedParameters;
  }
}
