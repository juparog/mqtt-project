import { MqttClientService } from '@kuiiksoft/shared/mqtt-client';
import { Controller, Inject, Logger } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  MqttContext,
  Payload,
} from '@nestjs/microservices';
import { MQTT_TRANSPORT } from '../app/app.constants';
import { DeviceManager } from './device.manager';
import { DeviceEvent, DeviceEventType, DeviceStatus } from './device.types';

@Controller()
export class DeviceController {
  private readonly logger = new Logger(DeviceController.name);

  constructor(
    @Inject(MQTT_TRANSPORT)
    private readonly client: MqttClientService,
    private readonly manager: DeviceManager
  ) {}

  @MessagePattern('device/types/list')
  async listDeviceTypes(@Ctx() context: MqttContext): Promise<string[]> {
    this.logger.debug(`Topic: ${context.getTopic()}`);
    const types = this.manager.getDeviceTypes();
    this.client.publish('device/types', { types });
    return types;
  }

  @MessagePattern('device/list')
  async listDevices(
    @Ctx() context: MqttContext,
    @Payload('type') type: string
  ): Promise<{ type: string; devices: unknown }> {
    this.logger.debug(`Topic: ${context.getTopic()}`);
    const devices = await this.manager.listDeviceByType(type);
    const response = { type, devices };
    this.client.publish('device', response);
    return response;
  }

  @MessagePattern('device/configure')
  async configureDevice(
    @Ctx() context: MqttContext,
    @Payload('type') type: string,
    @Payload('deviceId') deviceId: string,
    @Payload('options') options: unknown
  ): Promise<{ deviceId: string; result: boolean }> {
    this.logger.debug(`Topic: ${context.getTopic()}`);
    const result = await this.manager.configureDevice(type, deviceId, options);
    this.client.publish<DeviceEvent>(`device/${deviceId}/event`, {
      deviceId,
      eventType: DeviceEventType.CONFIGURE,
      deviceType: type,
      status: result,
    });
    return {
      deviceId,
      result: result === DeviceStatus.CONFIGURED,
    };
  }

  @MessagePattern('device/connect')
  async connectDevice(
    @Ctx() context: MqttContext,
    @Payload('deviceId') deviceId: string
  ): Promise<{ deviceId: string; result: DeviceStatus }> {
    this.logger.debug(`Topic: ${context.getTopic()}`);
    const device = await this.manager.getDevice(deviceId);
    const result = await device.connect();
    this.client.publish<DeviceEvent>(`device/${deviceId}/event`, {
      eventType: DeviceEventType.CONNECTE,
      deviceType: device.type,
      deviceId,
      status: result,
    });
    return { deviceId, result };
  }

  @MessagePattern('device/disconnect')
  async disconnectDevice(
    @Ctx() context: MqttContext,
    @Payload('deviceId') deviceId: string
  ): Promise<{ deviceId: string; result: DeviceStatus }> {
    this.logger.debug(`Topic: ${context.getTopic()}`);
    const device = await this.manager.getDevice(deviceId);
    const result = await device.disconnect();
    this.client.publish<DeviceEvent>(`device/${deviceId}/event`, {
      eventType: DeviceEventType.DISCONNECT,
      deviceType: device.type,
      deviceId,
      status: result,
    });
    return { deviceId, result };
  }

  @MessagePattern('device/send')
  async sendToDevice(
    @Ctx() context: MqttContext,
    @Payload() payload: unknown,
    @Payload('deviceId') deviceId: string,
    @Payload('message') message: unknown
  ): Promise<{ deviceId: string; result: boolean }> {
    this.logger.debug(`Topic: ${context.getTopic()}`);
    const device = await this.manager.getDevice(deviceId);
    const result = await device.send(message);
    this.client.publish<DeviceEvent>(`device/${deviceId}/event`, {
      eventType: DeviceEventType.DATA_SEND,
      deviceType: device.type,
      deviceId,
      status: result,
    });
    return { deviceId, result: result === DeviceStatus.OK };
  }
}
