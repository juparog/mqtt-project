import { Injectable } from '@nestjs/common';
import { DeviceAbstract } from './device.abstract';
import { DeviceFactory } from './device.factory';
import { DeviceStatus } from './device.types';

@Injectable()
export class DeviceManager {
  private readonly devices = new Map<string, DeviceAbstract>();

  constructor(private readonly interfaceFactory: DeviceFactory) {}

  getDeviceTypes(): string[] {
    return Array.from(this.interfaceFactory.getDeviceTypes());
  }

  async listDeviceByType<T = unknown>(type: string): Promise<T[]> {
    return this.interfaceFactory.getDeviceClass(type).listDevices();
  }

  async configureDevice<T = unknown>(
    type: string,
    deviceId: string,
    options: T
  ): Promise<DeviceStatus> {
    try {
      const deviceClass = this.interfaceFactory.getDeviceClassImpl(type);
      const device = new deviceClass(deviceId, options);
      this.devices.set(deviceId, device);
      return DeviceStatus.CONFIGURED;
    } catch (error) {
      return DeviceStatus.ERROR;
    }
  }

  async getDevice(deviceId: string): Promise<DeviceAbstract> {
    return this.devices.get(deviceId);
  }
}
