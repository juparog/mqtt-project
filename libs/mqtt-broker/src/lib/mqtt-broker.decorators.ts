import { CustomDecorator, SetMetadata } from '@nestjs/common';
import {
  KEY_SUBSCRIBE_OPTIONS,
  KEY_SUBSCRIBER_PARAMS,
  SystemTopics,
} from './mqtt-broker.constants';
import {
  MqttMessageTransformer,
  MqttSubscribeOptions,
  MqttSubscriberParameter,
} from './mqtt-broker.interfaces';

export function ListenOn(
  topic: string | string[] | RegExp | RegExp[] | MqttSubscribeOptions
): CustomDecorator;

export function ListenOn(
  topicOrOptions: string | string[] | RegExp | RegExp[] | MqttSubscribeOptions
): CustomDecorator {
  if (typeof topicOrOptions === 'string' || Array.isArray(topicOrOptions)) {
    return SetMetadata(KEY_SUBSCRIBE_OPTIONS, topicOrOptions);
  } else {
    return SetMetadata(KEY_SUBSCRIBE_OPTIONS, topicOrOptions);
  }
}

export function OnHeartBeat(): CustomDecorator {
  return SetMetadata(KEY_SUBSCRIBE_OPTIONS, SystemTopics.HEART_BEAT);
}

export function OnPublish(): CustomDecorator {
  return SetMetadata(KEY_SUBSCRIBE_OPTIONS, SystemTopics.PUBLISH);
}

export function OnClientReady(): CustomDecorator {
  return SetMetadata(KEY_SUBSCRIBE_OPTIONS, SystemTopics.CLIENT_READY);
}

export function OnClient(): CustomDecorator {
  return SetMetadata(KEY_SUBSCRIBE_OPTIONS, SystemTopics.CLIENT);
}

export function OnClientDisconnect(): CustomDecorator {
  return SetMetadata(KEY_SUBSCRIBE_OPTIONS, SystemTopics.CLIENT_DISCONNECT);
}

export function OnClientError(): CustomDecorator {
  return SetMetadata(KEY_SUBSCRIBE_OPTIONS, SystemTopics.CLIENT_ERROR);
}

export function OnSubscribe(): CustomDecorator {
  return SetMetadata(KEY_SUBSCRIBE_OPTIONS, SystemTopics.SUBSCRIBES);
}

export function OnUnsubscribe(): CustomDecorator {
  return SetMetadata(KEY_SUBSCRIBE_OPTIONS, SystemTopics.UNSUBSCRIBES);
}

export function OnAuthenticate(): CustomDecorator {
  return SetMetadata(KEY_SUBSCRIBE_OPTIONS, SystemTopics.AUTHENTICATE);
}

export function OnPreConnect(): CustomDecorator {
  return SetMetadata(KEY_SUBSCRIBE_OPTIONS, SystemTopics.PRE_CONNECT);
}

export function OnAuthorizePublish(): CustomDecorator {
  return SetMetadata(KEY_SUBSCRIBE_OPTIONS, SystemTopics.AUTHORIZE_PUBLISH);
}

export function OnAuthorizeSubscribe(): CustomDecorator {
  return SetMetadata(KEY_SUBSCRIBE_OPTIONS, SystemTopics.AUTHORIZE_SUBSCRIBE);
}

export function OnAuthorizeForward(): CustomDecorator {
  return SetMetadata(KEY_SUBSCRIBE_OPTIONS, SystemTopics.AUTHORIZE_FORWARD);
}

export function OnPublished(): CustomDecorator {
  return SetMetadata(KEY_SUBSCRIBE_OPTIONS, SystemTopics.PUBLISHED);
}

export function OnKeepLiveTimeout(): CustomDecorator {
  return SetMetadata(KEY_SUBSCRIBE_OPTIONS, SystemTopics.KEEP_LIVE_TIMEOUT);
}

export function OnAck(): CustomDecorator {
  return SetMetadata(KEY_SUBSCRIBE_OPTIONS, SystemTopics.ACK);
}

export function OnConnackSent(): CustomDecorator {
  return SetMetadata(KEY_SUBSCRIBE_OPTIONS, SystemTopics.CONNACK_SENT);
}

export function OnClosed(): CustomDecorator {
  return SetMetadata(KEY_SUBSCRIBE_OPTIONS, SystemTopics.CLOSED);
}

export function OnConnectionError(): CustomDecorator {
  return SetMetadata(KEY_SUBSCRIBE_OPTIONS, SystemTopics.CONNECTION_ERROR);
}

function SetParameter(parameter: Partial<MqttSubscriberParameter>) {
  return (target: object, propertyKey: string | symbol, paramIndex: number) => {
    const _target = target as { [key: string | symbol]: object };
    const params =
      Reflect.getMetadata(KEY_SUBSCRIBER_PARAMS, _target[propertyKey]) || [];
    params.push({
      index: paramIndex,
      ...parameter,
    });
    Reflect.defineMetadata(KEY_SUBSCRIBER_PARAMS, params, _target[propertyKey]);
  };
}

export function Topic() {
  return SetParameter({
    type: 'topic',
  });
}

export function Payload(
  transform?: 'json' | 'text' | MqttMessageTransformer<unknown>
) {
  return SetParameter({
    type: 'payload',
    transform,
  });
}

export function Client(
  transform?: 'json' | 'text' | MqttMessageTransformer<unknown>
) {
  return SetParameter({
    type: 'client',
    transform,
  });
}

export function Packet() {
  return SetParameter({
    type: 'packet',
  });
}

export function Subscription() {
  return SetParameter({
    type: 'subscription',
  });
}

export function Subscriptions() {
  return SetParameter({
    type: 'subscriptions',
  });
}

export function Unsubscription() {
  return SetParameter({
    type: 'unsubscription',
  });
}

export function Function() {
  return SetParameter({
    type: 'function',
  });
}

export function Credential() {
  return SetParameter({
    type: 'credential',
  });
}

export function Host() {
  return SetParameter({
    type: 'host',
  });
}

export function Error() {
  return SetParameter({
    type: 'error',
  });
}
