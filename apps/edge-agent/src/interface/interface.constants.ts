export const SERIAL_INTERFACE = 'serial';

export enum SERIALPORT_STATUS {
  OPENED = 'opened',
  CLOSED = 'closed',
}

export const SERIALPORT_DISCONNECT_EVENT =
  'interface.serial.device.disconnected';

export const SERIAL_LIST_PATTERN = `interface/${SERIAL_INTERFACE}/list`;
export const SERIAL_CONFIGURE_PATTERN = `interface/${SERIAL_INTERFACE}/configure`;
export const SERIAL_CLOSE_PATTERN = `interface/${SERIAL_INTERFACE}/close`;
export const SERIAL_CONNECTION_PATTERN = `interface/${SERIAL_INTERFACE}/connections/list`;

export const SERIAL_PORTS_TOPIC = `interface/${SERIAL_INTERFACE}`;
export const SERIAL_CONNECTIONS_TOPIC = `interface/${SERIAL_INTERFACE}/connections`;
export const SERIAL_DEVICE_STATUS_TOPIC = (
  text: TemplateStringsArray,
  path: string
) => `interface/${SERIAL_INTERFACE}/device/${path}/status`;
export const SERIAL_DEVICE_ERROR_TOPIC = (
  text: TemplateStringsArray,
  path: string
) => `interface/${SERIAL_INTERFACE}/device/${path}/error`;
export const SERIAL_DEVICE_DATA_TOPIC = (
  text: TemplateStringsArray,
  path: string
) => `interface/${SERIAL_INTERFACE}/device/${path}/data`;
