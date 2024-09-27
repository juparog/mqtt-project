import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';

import { MQTT_TRANSPORT } from '../app/app.constants';
import { MqttCustomStrategy } from '../mqtt.strategy';
import {
  SERIAL_CONNECTIONS_TOPIC,
  SERIAL_INTERFACE,
  SERIAL_PORTS_TOPIC,
  SERIALPORT_DISCONNECT_EVENT,
  SERIALPORT_STATUS,
} from './interface.constants';
import { SerialInterfaceService } from './serial-interface.service';

@Injectable()
export class InterfaceManagerService {
  private serialDevices = new Map<
    string,
    { status: SERIALPORT_STATUS; sp: SerialInterfaceService }
  >();

  constructor(
    @Inject(MQTT_TRANSPORT)
    private readonly mqttService: MqttCustomStrategy,
    private eventEmitter: EventEmitter2
  ) {}

  getAvailableInterfaces(): string[] {
    return [SERIAL_INTERFACE];
  }

  async initializeSerialInterface(path: string, baudRate: number) {
    const serialInterface = new SerialInterfaceService(
      this.mqttService,
      { path, baudRate },
      this.eventEmitter
    );
    this.serialDevices.set(path, {
      sp: serialInterface,
      status: SERIALPORT_STATUS.OPENED,
    });
  }

  getSerialDeviceConnections(): { path: string; status: SERIALPORT_STATUS }[] {
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
      portList: await SerialInterfaceService.portsList(),
    });
  }

  publishSerialConnections() {
    this.mqttService.publish(SERIAL_CONNECTIONS_TOPIC, {
      connections: this.getSerialDeviceConnections(),
    });
  }

  @OnEvent(SERIALPORT_DISCONNECT_EVENT)
  handleOrderCreatedEvent(payload: { path: string }) {
    this.closeSerialDevice(payload.path);
  }
}
