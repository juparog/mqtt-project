export enum DeviceStatus {
  CONFIGURED = 'configured',
  CONNECTED = 'connected',
  OK = 'ok',
  DISCONNECTED = 'disconnected',
  BUSY = 'busy',
  ERROR = 'error',
  UNKNOWN = 'unknown',
}

export enum DeviceEventType {
  CONFIGURE = 'device.configure',
  CONNECTE = 'device.connect',
  DATA_SEND = 'device.data.send',
  DISCONNECT = 'device.disconnect',
  ERROR = 'device.error',
  DATA_RECEIVE = 'device.data.receive',
}

export interface DeviceEvent {
  eventType: DeviceEventType;
  deviceType: string;
  deviceId: string;
  status: DeviceStatus;
  payload?: unknown;
}
