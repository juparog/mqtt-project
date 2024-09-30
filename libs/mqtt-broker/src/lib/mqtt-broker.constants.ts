export const MQTTBROKER_OPTION_MODULE = Symbol('MQTTBROKER_OPTION_MODULE');
export const MQTTBROKER_LOGGER_PROVIDER = Symbol('MQTTBROKER_LOGGER_PROVIDER');
export const MQTTBROKER_INSTANCE = Symbol('MQTTBROKER_INSTANCE');

export const LOGGER_KEY = 'MQTT Broker Module';

export const KEY_SUBSCRIBE_OPTIONS = '__mqttbroker_subscribe_options';
export const KEY_SUBSCRIBER_PARAMS = '__mqttbroker_subscriber_params';
export const REGISTRY_METADATA_KEY = Symbol('__my-app--registry__');

export const SystemTopics = {
  PUBLISH: '$MQTTBROKER/new/publish',
  CLIENT_READY: '$MQTTBROKER/event/ready/clients',
  CLIENT: '$MQTTBROKER/event/clients',
  CLIENT_DISCONNECT: '$MQTTBROKER/event/disconnect/clients',
  CLIENT_ERROR: '$MQTTBROKER/event/error/clients',
  KEEP_LIVE_TIMEOUT: '$MQTTBROKER/event/keepalivetimeout',
  ACK: '$MQTTBROKER/event/ack',
  PING: '$MQTTBROKER/event/ping',
  CONNACK_SENT: '$MQTTBROKER/event/connack/sent',
  CLOSED: '$MQTTBROKER/event/closed',
  CONNECTION_ERROR: '$MQTTBROKER/event/error/connection',
  SUBSCRIBES: '$MQTTBROKER/event/subscribes',
  UNSUBSCRIBES: '$MQTTBROKER/event/unsubscribes',
  AUTHENTICATE: '$MQTTBROKER/handle/authenticate',
  PRE_CONNECT: '$MQTTBROKER/handle/preconnect',
  AUTHORIZE_PUBLISH: '$MQTTBROKER/handle/authorizePublish',
  AUTHORIZE_SUBSCRIBE: '$MQTTBROKER/handle/authorizeSubscribe',
  AUTHORIZE_FORWARD: '$MQTTBROKER/handle/authorizeForward',
  PUBLISHED: '$MQTTBROKER/handle/published',
  HEART_BEAT: /^\$?SYS\/([^/\n]*)\/heartbeat/,
  CLIENT_REGISTER: /^\$?SYS\/([^/\n]*)\/new\/clients/,
  CLIENT_DEREGISTER: /^\$?SYS\/([^/\n]*)\/disconnect\/clients/,
};

export enum BrokerTransport {
  TCP = 'tcp',
  WS = 'ws',
}
