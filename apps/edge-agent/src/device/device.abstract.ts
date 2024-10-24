import { DeviceStatus } from './device.types';

export abstract class DeviceAbstract<Options = unknown> {
  static readonly type: string;
  static availableDevices: () => Promise<unknown[]>;

  private readonly _deviceId: string;

  constructor(deviceId: string, protected readonly options?: Options) {
    this._deviceId = deviceId;
  }

  abstract connect(): Promise<DeviceStatus>;

  abstract disconnect(): Promise<DeviceStatus>;

  abstract send(data: unknown): Promise<DeviceStatus>;

  get deviceId(): string {
    return this._deviceId;
  }

  get type(): string {
    return (this.constructor as typeof DeviceAbstract).getType(
      this.constructor.name
    );
  }

  static getType(className: string): string {
    if (!this.type) {
      throw new Error(
        `Device type not defined for class: ${className}, please set the static type property`
      );
    }
    return this.type;
  }

  static async listDevices<DeviceInfo = unknown>(): Promise<DeviceInfo[]> {
    if (!this.availableDevices) {
      throw new Error(
        'Device list not available, please set the static availableDevices property'
      );
    }
    return this.availableDevices() as Promise<DeviceInfo[]>;
  }
}
