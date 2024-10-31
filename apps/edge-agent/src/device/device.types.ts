export enum DeviceStatus {
  CONFIGURED = 'configured',
  CONNECTED = 'connected',
  OK = 'ok',
  DISCONNECTED = 'disconnected',
  BUSY = 'busy',
  ERROR = 'error',
  UNKNOWN = 'unknown',
}

export enum DeviceEventTypes {
  CONFIGURE = 'device.configure',
  CONNECTE = 'device.connect',
  DATA_SEND = 'device.data.send',
  DATA_RECEIVE = 'device.data.receive',
  DISCONNECT = 'device.disconnect',
  ERROR = 'device.error',
}

type BaseEvent = {
  eventType: DeviceEventTypes;
  deviceId: string;
  deviceType: string;
  status: DeviceStatus;
};

type ConfigureEvent = BaseEvent & {
  eventType: DeviceEventTypes.CONFIGURE;
};

type ConnectEvent = BaseEvent & {
  eventType: DeviceEventTypes.CONNECTE;
};

type DataSendEvent = BaseEvent & {
  eventType: DeviceEventTypes.DATA_SEND;
  payload: unknown;
};

type DataReceiveEvent = BaseEvent & {
  eventType: DeviceEventTypes.DATA_RECEIVE;
  payload: unknown;
};

type DisconnectEvent = BaseEvent & {
  eventType: DeviceEventTypes.DISCONNECT;
};

type ErrorEvent = BaseEvent & {
  eventType: DeviceEventTypes.ERROR;
  payload: string;
};

export type DeviceEvent =
  | ConfigureEvent
  | ConnectEvent
  | DataSendEvent
  | DataReceiveEvent
  | DisconnectEvent
  | ErrorEvent;
