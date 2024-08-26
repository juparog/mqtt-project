export const MQTT_TRANSPORT = Symbol('MQTT_TRANSPORT');

export enum AGENT_INTERFACES {
  SERIAL = 'serial',
}

export enum SERIALPORT_STATUS {
  OPENED = 'opened',
  CLOSED = 'closed',
}

export const SERIALPORT_DISCONNECT_EVENT =
  'interface.serial.device.disconnected';

export const SERIAL_LIST_PATTERN = `interface/${AGENT_INTERFACES.SERIAL}/list`;
export const SERIAL_CONFIGURE_PATTERN = `interface/${AGENT_INTERFACES.SERIAL}/configure`;
export const SERIAL_CLOSE_PATTERN = `interface/${AGENT_INTERFACES.SERIAL}/close`;
export const SERIAL_CONNECTION_PATTERN = `interface/${AGENT_INTERFACES.SERIAL}/connections/list`;

export const SERIAL_PORTS_TOPIC = `interface/${AGENT_INTERFACES.SERIAL}`;
export const SERIAL_CONNECTIONS_TOPIC = `interface/${AGENT_INTERFACES.SERIAL}/connections`;
export const SERIAL_DEVICE_STATUS_TOPIC = (
  text: TemplateStringsArray,
  path: string
) => `interface/${AGENT_INTERFACES.SERIAL}/device/${path}/status`;
export const SERIAL_DEVICE_ERROR_TOPIC = (
  text: TemplateStringsArray,
  path: string
) => `interface/${AGENT_INTERFACES.SERIAL}/device/${path}/error`;
export const SERIAL_DEVICE_DATA_TOPIC = (
  text: TemplateStringsArray,
  path: string
) => `interface/${AGENT_INTERFACES.SERIAL}/device/${path}/data`;
