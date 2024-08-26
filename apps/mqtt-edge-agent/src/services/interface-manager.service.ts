import { Inject, Injectable } from '@nestjs/common';

import { AGENT_INTERFACES, MQTT_TRANSPORT } from '../app.constants';
import { SerialInterface } from '../interfaces';
import { MqttCustomStrategy } from '../mqtt.strategy';

@Injectable()
export class InterfaceManagerService {
  private usbInterfaces = new Map<string, SerialInterface>();

  constructor(
    @Inject(MQTT_TRANSPORT)
    private readonly mqttService: MqttCustomStrategy
  ) {}

  public async initializeUsbInterface(path: string, baudRate: number) {
    const serialInterface = new SerialInterface(this.mqttService, {
      path,
      baudRate,
    });
    this.usbInterfaces.set(path, serialInterface);

    this.mqttService.subscribe(`device/usb/${path}/disconnected`, (message) => {
      const { path } = JSON.parse(message);
      this.closeUsbInterface(path);
    });
  }

  public getAvailableInterfaces(): string[] {
    return Object.values(AGENT_INTERFACES);
  }

  public getAvailableUsbConnections(): string[] {
    return [...this.usbInterfaces.keys()];
  }

  public closeUsbInterface(path: string) {
    if (this.usbInterfaces.has(path)) {
      this.usbInterfaces.get(path)?.close();
      this.usbInterfaces.delete(path);
    }
  }
}
