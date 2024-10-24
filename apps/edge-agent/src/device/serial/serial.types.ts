import { SerialPort } from 'serialport';

export type SerialPortOptions = Omit<SerialPort['settings'], 'binding'>;
