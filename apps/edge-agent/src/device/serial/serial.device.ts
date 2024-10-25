import { Logger } from '@nestjs/common';
import { PortInfo } from '@serialport/bindings-interface';
import { ReadlineParser, SerialPort } from 'serialport';
import { DeviceAbstract } from '../device.abstract';
import { DeviceStatus } from '../device.types';
import { SerialPortOptions } from './serial.types';

export class SerialDevice extends DeviceAbstract<SerialPortOptions> {
  static readonly type = 'serial';

  private readonly logger = new Logger(SerialDevice.name);
  private readonly port: SerialPort;
  private readonly parser: ReadlineParser;

  constructor(deviceId: string, options: SerialPortOptions) {
    super(deviceId, options);
    this.port = new SerialPort({
      baudRate: options.baudRate,
      path: options.path,
      autoOpen: false,
    });
    this.parser = this.port.pipe(new ReadlineParser({ delimiter: '\n' }));
  }

  static availableDevices = async (): Promise<PortInfo[]> => {
    const ports = await SerialPort.list();
    return ports.map((port) => ({
      path: port.path,
      manufacturer: port.manufacturer,
      serialNumber: port.serialNumber,
      pnpId: port.pnpId,
      locationId: port.locationId,
      vendorId: port.vendorId,
      productId: port.productId,
    }));
  };

  async connect(): Promise<DeviceStatus> {
    return new Promise((resolve) => {
      this.port.open((error) => {
        if (error) {
          this.logger.error(error.message);
          resolve(DeviceStatus.ERROR);
        } else {
          this.logger.log(
            `Connected to serial device '${this.id}' at '${this.port.path}'`
          );
          resolve(DeviceStatus.CONNECTED);
        }
      });
    });
  }

  async disconnect(): Promise<DeviceStatus> {
    return new Promise((resolve) => {
      this.port.close((error) => {
        if (error) {
          this.logger.error(error.message);
          resolve(DeviceStatus.ERROR);
        } else {
          this.logger.log(
            `Disconnected from serial device '${this.id}' at '${this.port.path}'`
          );
          resolve(DeviceStatus.DISCONNECTED);
        }
      });
    });
  }

  async send(data: unknown): Promise<DeviceStatus> {
    return new Promise((resolve) => {
      const dataString = typeof data === 'string' ? data : JSON.stringify(data);
      this.port.write(`${dataString}\n`, (error) => {
        if (error) {
          this.logger.error(error.message);
          resolve(DeviceStatus.ERROR);
        } else {
          this.logger.debug(
            `Data sent to serial device '${this.id}' at '${this.port.path}': ${data}`
          );
          resolve(DeviceStatus.OK);
        }
      });
    });
  }

  setupDataListener(): void {
    this.parser.on('data', (data) => {
      this.logger.debug(
        `Data received from serial device '${this.id}' at '${this.port.path}': ${data}`
      );
      this.emit('data', data);
    });
  }

  setupDisconnectListener(): void {
    this.port.on('close', () => {
      this.logger.log(
        `Serial device '${this.id}' at '${this.port.path}' closed connection`
      );
      this.emit('disconnect');
    });
  }

  setupErrorListener(): void {
    this.port.on('error', (error) => {
      const errorMessage = `Serial device '${this.id}' at '${this.port.path}' error: ${error.message}`;
      this.logger.error(errorMessage);
      this.emit('error', new Error(errorMessage));
    });
  }
}
