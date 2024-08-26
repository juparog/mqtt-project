import { Inject, Injectable } from '@nestjs/common';

import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import {
  AGENT_INTERFACES,
  MQTT_TRANSPORT,
  SERIAL_CONNECTIONS_TOPIC,
  SERIAL_PORTS_TOPIC,
  SERIALPORT_DISCONNECT_EVENT,
  SERIALPORT_STATUS,
} from '../app.constants';
import { SerialInterface } from '../interfaces';
import { MqttCustomStrategy } from '../mqtt.strategy';

@Injectable()
export class InterfaceManagerService {
  private serialDevices = new Map<
    string,
    { status: SERIALPORT_STATUS; sp: SerialInterface }
  >();

  constructor(
    @Inject(MQTT_TRANSPORT)
    private readonly mqttService: MqttCustomStrategy,
    private eventEmitter: EventEmitter2
  ) {}

  async initializeUsbInterface(path: string, baudRate: number) {
    const serialInterface = new SerialInterface(
      this.mqttService,
      { path, baudRate },
      this.eventEmitter
    );
    this.serialDevices.set(path, {
      sp: serialInterface,
      status: SERIALPORT_STATUS.OPENED,
    });
  }

  getAvailableInterfaces(): string[] {
    return Object.values(AGENT_INTERFACES);
  }

  geSerialDeviceConnections(): { path: string; status: SERIALPORT_STATUS }[] {
    return Array.from(this.serialDevices.entries()).map(([key, val]) => ({
      path: key,
      status: val.status,
    }));
  }

  closeSerialDevice(path: string) {
    if (this.serialDevices.has(path)) {
      this.serialDevices.get(path)?.sp.close();
      this.serialDevices.set(path, {
        ...this.serialDevices.get(path),
        status: SERIALPORT_STATUS.CLOSED,
      });
    }
  }

  async publishSerialPorts() {
    this.mqttService.publish(SERIAL_PORTS_TOPIC, {
      portList: await SerialInterface.portsList(),
    });
  }

  publishSerialConnections() {
    this.mqttService.publish(SERIAL_CONNECTIONS_TOPIC, {
      connections: this.geSerialDeviceConnections(),
    });
  }

  @OnEvent(SERIALPORT_DISCONNECT_EVENT)
  handleOrderCreatedEvent(payload: { path: string }) {
    this.closeSerialDevice(payload.path);
  }
}
