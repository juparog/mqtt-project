import { Inject, Injectable } from '@nestjs/common';
import { IMqttTransport, MQTT_TRANSPORT } from '../app';
import { DeviceAbstract } from './device.abstract';
import { DeviceFactory } from './device.factory';
import { DeviceEvent, DeviceEventTypes, DeviceStatus } from './device.types';

@Injectable()
export class DeviceManager {
  private readonly devices = new Map<string, DeviceAbstract>();

  constructor(
    private readonly interfaceFactory: DeviceFactory,
    @Inject(MQTT_TRANSPORT)
    private readonly transport: IMqttTransport
  ) {}

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
      this.addEventListeners(device);
      this.devices.set(deviceId, device);
      return DeviceStatus.CONFIGURED;
    } catch (error) {
      return DeviceStatus.ERROR;
    }
  }

  async getDevice(deviceId: string): Promise<DeviceAbstract> {
    if (!this.devices.has(deviceId)) {
      throw new Error(`Device '${deviceId}' not found`);
    }
    return this.devices.get(deviceId);
  }

  private addEventListeners(device: DeviceAbstract): void {
    device.addEventListener('data', this.deviceDataListener.bind(this));
    device.addEventListener(
      'disconnect',
      this.deviceDisconnectListener.bind(this)
    );
    device.addEventListener('error', this.deviceErrorListener.bind(this));
    device.initEvents();
  }

  private deviceDataListener(deviceId: string, data: unknown): void {
    this.transport.publish<DeviceEvent>(`device/${deviceId}/event`, {
      deviceId,
      eventType: DeviceEventTypes.DATA_RECEIVE,
      deviceType: this.devices.get(deviceId).type,
      status: DeviceStatus.OK,
      payload: data,
    });
  }

  private deviceDisconnectListener(deviceId: string): void {
    this.transport.publish<DeviceEvent>(`device/${deviceId}/event`, {
      deviceId,
      eventType: DeviceEventTypes.DISCONNECT,
      deviceType: this.devices.get(deviceId).type,
      status: DeviceStatus.DISCONNECTED,
    });
  }

  private deviceErrorListener(deviceId: string, error: Error): void {
    this.transport.publish<DeviceEvent>(`device/${deviceId}/event`, {
      deviceId,
      eventType: DeviceEventTypes.ERROR,
      deviceType: this.devices.get(deviceId).type,
      status: DeviceStatus.ERROR,
      payload: error.message,
    });
  }
}
