import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import Aedes, {
  AuthenticateError,
  Client,
  PublishPacket,
  Subscription,
} from 'aedes';
import { IPacket } from 'mqtt-packet';
import { isRegExp } from 'util/types';

import { MQTTBROKER_INSTANCE, SystemTopics } from './mqtt-broker.constants';
import { MqttBrokerDiscovery } from './mqtt-broker.discovery';
import {
  DiscoveredMethodWithMeta,
  Host,
  MqttSubscriberParameter,
} from './mqtt-broker.interfaces';
import { getTransform } from './mqtt-broker.transforms';

type DiscoveredMethodWithMetaAndParameters = DiscoveredMethodWithMeta & {
  params: MqttSubscriberParameter[];
};

type HandlerMethodParameters = {
  client?: Client | null;
  packet?: IPacket;
  topic?: string;
  payload?: unknown;
  subscription?: Subscription;
  subscriptions?: Subscription[];
  unsubscription?: string[];
  callback?:
    | ((error: Error | null, success: boolean) => void)
    | ((error: AuthenticateError | null, success: boolean | null) => void)
    | ((
        error: Error | null,
        subscription?: Subscription | null | undefined
      ) => void);
  username?: string;
  password?: Readonly<Buffer>;
  error?: Error;
};

@Injectable()
export class MqttBrokerResolver implements OnModuleInit {
  private readonly logger = new Logger(MqttBrokerResolver.name);
  constructor(
    private readonly mqttBrokerDiscovery: MqttBrokerDiscovery,
    @Inject(MQTTBROKER_INSTANCE) private readonly broker: Aedes
  ) {}

  async onModuleInit() {
    await this.init();
    this.logger.log('MqttBrokerExplorer initialized');
  }

  async init() {
    const methods = await this.discoverMethods();

    // Set up preConnect listener
    const preConnectMethod = this.getSubscribers(
      SystemTopics.PRE_CONNECT,
      methods,
      true
    );

    if (preConnectMethod.length > 0) {
      this.broker.preConnect = (client, packet, callback) => {
        this.processHandlerListener(preConnectMethod, {
          client,
          packet,
          callback,
        });
      };
    }

    // Set up clientDisconnect listener
    const clientDisconnectMethods = this.getSubscribers(
      SystemTopics.CLIENT_DISCONNECT,
      methods
    );

    if (clientDisconnectMethods.length > 0) {
      this.broker.on('clientDisconnect', (client: Client) => {
        this.processHandlerListener(clientDisconnectMethods, { client });
      });
    }

    // Set up authenticate listener
    const authenticateMethod = this.getSubscribers(
      SystemTopics.AUTHENTICATE,
      methods,
      true
    );
    if (authenticateMethod.length > 0) {
      this.broker.authenticate = (client, username, password, callback) => {
        this.processHandlerListener(authenticateMethod, {
          client,
          callback,
          username,
          password,
        });
      };
    }

    // Set up authorizePublish listener
    const authorizePublishMethod = this.getSubscribers(
      SystemTopics.AUTHORIZE_PUBLISH,
      methods,
      true
    );
    if (authorizePublishMethod.length > 0) {
      this.broker.authorizePublish = (client, packet, callback) => {
        this.processHandlerListener(authorizePublishMethod, {
          client,
          packet,
          callback,
        });
      };
    }

    // Set up authorizeSubscribe listener
    const authorizeSubscribeMethod = this.getSubscribers(
      SystemTopics.AUTHORIZE_SUBSCRIBE,
      methods,
      true
    );
    if (authorizeSubscribeMethod.length > 0) {
      this.broker.authorizeSubscribe = (client, subscription, callback) => {
        this.processHandlerListener(authorizeSubscribeMethod, {
          client,
          subscription: subscription,
          callback,
        });
      };
    }

    // Set up authorizeForward listener
    const authorizeForwardMethod = this.getSubscribers(
      SystemTopics.AUTHORIZE_FORWARD,
      methods,
      true
    );
    if (authorizeForwardMethod.length > 0) {
      this.broker.authorizeForward = (client, packet) => {
        this.processHandlerListener(authorizeForwardMethod, {
          client,
          packet,
        });
      };
    }

    // Set up published listener
    const publishedMethod = this.getSubscribers(
      SystemTopics.PUBLISHED,
      methods,
      true
    );
    if (publishedMethod.length > 0) {
      this.broker.published = (packet, client, callback) => {
        this.processHandlerListener(publishedMethod, {
          client,
          packet,
          callback,
        });
      };
    }

    // Set up an event listener on the "publish" event of a broker object
    this.broker.on('publish', (packet, client) => {
      let subscriber: DiscoveredMethodWithMetaAndParameters[] = [];

      if (
        SystemTopics.CLIENT_REGISTER.test(packet.topic) ||
        SystemTopics.CLIENT_DEREGISTER.test(packet.topic) ||
        SystemTopics.HEART_BEAT.test(packet.topic)
      ) {
        packet['payload'] = JSON.stringify({
          clientId: packet.payload.toString(),
        });
      }

      if (SystemTopics.HEART_BEAT.test(packet.topic)) {
        subscriber = this.getSubscribers(SystemTopics.HEART_BEAT, methods);
      } else {
        subscriber = [
          ...this.getSubscribers(packet.topic, methods),
          ...this.getSubscribers(SystemTopics.PUBLISH, methods),
        ];
      }

      this.processHandlerListener(subscriber, {
        client,
        packet,
      });
    });

    // Set up clientReady listener
    const clientReadyMethod = this.getSubscribers(
      SystemTopics.CLIENT_READY,
      methods,
      true
    );
    if (clientReadyMethod.length > 0) {
      this.broker.on('clientReady', (client) => {
        this.processHandlerListener(clientReadyMethod, { client });
      });
    }

    // Set up client listener
    const clientMethod = this.getSubscribers(
      SystemTopics.CLIENT,
      methods,
      true
    );
    if (clientMethod.length > 0) {
      this.broker.on('client', (client) => {
        this.processHandlerListener(clientMethod, { client });
      });
    }

    // Set up clientError listener
    const clientErrorMethod = this.getSubscribers(
      SystemTopics.CLIENT_ERROR,
      methods,
      true
    );
    if (clientErrorMethod.length > 0) {
      this.broker.on('clientError', (client, error) => {
        this.processHandlerListener(clientErrorMethod, { client, error });
      });
    }

    // Set up subscribe listener
    const subscribeMethod = this.getSubscribers(
      SystemTopics.SUBSCRIBES,
      methods,
      true
    );
    if (subscribeMethod.length > 0) {
      this.broker.on('subscribe', (subscriptions, client) => {
        this.processHandlerListener(subscribeMethod, {
          client,
          subscriptions,
        });
      });
    }

    // Set up unsubscribe listener
    const unsubscribeMethod = this.getSubscribers(
      SystemTopics.UNSUBSCRIBES,
      methods,
      true
    );
    if (unsubscribeMethod.length > 0) {
      this.broker.on('unsubscribe', (unsubscription, client) => {
        this.processHandlerListener(unsubscribeMethod, {
          client,
          unsubscription,
        });
      });
    }

    // Set up ping listener
    const pingMethod = this.getSubscribers(SystemTopics.PING, methods, true);
    if (pingMethod.length > 0) {
      this.broker.on('ping', (packet, client) => {
        this.processHandlerListener(pingMethod, { client, packet });
      });
    }

    // Set up connectionError listener
    const connectionErrorMethod = this.getSubscribers(
      SystemTopics.CONNECTION_ERROR,
      methods,
      true
    );
    if (connectionErrorMethod.length > 0) {
      this.broker.on('connectionError', (client, error) => {
        this.processHandlerListener(connectionErrorMethod, { client, error });
      });
    }

    // Set up keepaliveTimeout listener
    const keepaliveTimeoutMethod = this.getSubscribers(
      SystemTopics.KEEP_LIVE_TIMEOUT,
      methods,
      true
    );
    if (keepaliveTimeoutMethod.length > 0) {
      this.broker.on('keepaliveTimeout', (client) => {
        this.processHandlerListener(keepaliveTimeoutMethod, { client });
      });
    }

    // Set up ack listener
    const ackMethod = this.getSubscribers(SystemTopics.ACK, methods, true);
    if (ackMethod.length > 0) {
      this.broker.on('ack', (packet, client) => {
        this.processHandlerListener(ackMethod, { client, packet });
      });
    }

    // Set up closed listener
    const closedMethod = this.getSubscribers(
      SystemTopics.CLOSED,
      methods,
      true
    );
    if (closedMethod.length > 0) {
      this.broker.on('closed', () => {
        this.processHandlerListener(closedMethod);
      });
    }

    // Set up connackSent listener
    const connackSentMethod = this.getSubscribers(
      SystemTopics.CONNACK_SENT,
      methods,
      true
    );
    if (connackSentMethod.length > 0) {
      this.broker.on('connackSent', (packet, client) => {
        this.processHandlerListener(connackSentMethod, { client, packet });
      });
    }

    for (const method of methods) {
      this.logger.log(
        `Mapped {${method.discoveredMethod.methodName}, ${method.params
          .map((p) => `${p.type}`)
          .join(', ')}} subscribtion`
      );
    }
  }

  private async discoverMethods() {
    const providers = this.mqttBrokerDiscovery.getNonRequestScopedProviders();
    const discoveredClasses = await this.mqttBrokerDiscovery.discoverClasses(
      providers
    );
    const discoveredMethods =
      this.mqttBrokerDiscovery.discoverMethods(discoveredClasses);
    return this.mqttBrokerDiscovery.addMethodParameters(discoveredMethods);
  }

  private getSubscribers(
    metaKey: string | RegExp,
    methods: DiscoveredMethodWithMetaAndParameters[],
    single = false
  ): DiscoveredMethodWithMetaAndParameters[] {
    const subscribers = methods.filter(
      (p) =>
        (isRegExp(p.meta) && p.meta.test(String(metaKey))) || p.meta === metaKey
    );
    return single && subscribers.length > 0 ? [subscribers[0]] : subscribers;
  }

  private processHandlerListener(
    subscribers: DiscoveredMethodWithMetaAndParameters[],
    params?: HandlerMethodParameters
  ) {
    subscribers.forEach((subscriber) => {
      try {
        subscriber.discoveredMethod.handler.bind(
          subscriber.discoveredMethod.parentClass.instance
        )(...this.getHandlerMethodParameters(subscriber.params, params));
      } catch (err) {
        this.logger.error(err);
      }
    });
  }

  private getHandlerMethodParameters(
    parameters: MqttSubscriberParameter[],
    params?: HandlerMethodParameters
  ) {
    return parameters.map((parameter) => {
      switch (parameter?.type) {
        case 'client':
          return params?.client;
        case 'host':
          return this.getHost();
        case 'credential':
          return {
            username: params?.username,
            password: params?.password,
          };
        case 'function':
          return params?.callback;
        case 'subscription':
          return params?.subscription;
        case 'subscriptions':
          return params?.subscriptions;
        case 'unsubscription':
          return params?.unsubscription;
        case 'topic':
          return (params?.packet as PublishPacket).topic;
        case 'payload':
          return getTransform(parameter.transform)(
            (params?.packet as PublishPacket).payload
          );
        case 'error':
          return params?.error;
        case 'packet':
          return params?.packet;
        default:
          return null;
      }
    });
  }

  private getHost(): Host {
    return {
      id: this.broker.id,
      connectedClients: this.broker.connectedClients,
      closed: this.broker.closed,
    };
  }
}
