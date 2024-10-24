import { Logger } from '@nestjs/common';
import { PortInfo } from '@serialport/bindings-interface';
import { SerialPort } from 'serialport';
import { DeviceAbstract } from '../device.abstract';
import { DeviceStatus } from '../device.types';
import { SerialPortOptions } from './serial.types';

export class SerialDevice extends DeviceAbstract<SerialPortOptions> {
  static readonly type = 'serial';

  private readonly logger = new Logger(SerialDevice.name);
  private readonly sp: SerialPort;

  constructor(deviceId: string, options: SerialPortOptions) {
    super(deviceId, options);
    this.sp = new SerialPort({
      baudRate: options.baudRate,
      path: options.path,
      autoOpen: false,
    });
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
      this.sp.open((error) => {
        if (error) {
          this.logger.error(error.message);
          resolve(DeviceStatus.ERROR);
        } else {
          this.logger.log(`Connected to serial device '${this.deviceId}'`);
          resolve(DeviceStatus.CONNECTED);
        }
      });
    });
  }

  async disconnect(): Promise<DeviceStatus> {
    return new Promise((resolve) => {
      this.sp.close((error) => {
        if (error) {
          this.logger.error(error.message);
          resolve(DeviceStatus.ERROR);
        } else {
          this.logger.log(`Disconnected from serial device '${this.deviceId}'`);
          resolve(DeviceStatus.DISCONNECTED);
        }
      });
    });
  }

  async send(data: unknown): Promise<DeviceStatus> {
    return new Promise((resolve) => {
      // TODO: validar y enviar datos
      this.sp.write(data, (error) => {
        if (error) {
          this.logger.error(error.message);
          resolve(DeviceStatus.ERROR);
        } else {
          this.logger.debug(`Data sent to serial device '${this.deviceId}'`);
          resolve(DeviceStatus.OK);
        }
      });
    });
  }
}
