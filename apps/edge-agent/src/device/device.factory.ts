import { Injectable } from '@nestjs/common';
import { DeviceAbstract } from './device.abstract';

type DeviceClassType = typeof DeviceAbstract<unknown>;
type DeviceClassImpl = new (...args: unknown[]) => DeviceAbstract<unknown>;
type DeviceClass = DeviceClassImpl & DeviceClassType;

@Injectable()
export class DeviceFactory {
  private readonly deviceClasses = new Map<string, DeviceClass>();

  register(classes: DeviceClass[] = []) {
    classes.forEach((deviceClass) => {
      this.deviceClasses.set(
        deviceClass.getType(deviceClass.name),
        deviceClass
      );
    });
  }

  getDeviceClass(type: string): DeviceClassType {
    const deviceClass = this.deviceClasses.get(type);
    if (!deviceClass) {
      throw new Error(`Device class not found for type: ${type}`);
    }
    return deviceClass;
  }

  getDeviceClassImpl(type: string): DeviceClassImpl {
    return this.getDeviceClass(type) as DeviceClass;
  }

  getDeviceTypes(): string[] {
    return Array.from(this.deviceClasses.keys());
  }
}
