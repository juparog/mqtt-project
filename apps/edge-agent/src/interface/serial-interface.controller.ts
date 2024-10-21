import { Controller, Logger } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  MqttContext,
  Payload,
} from '@nestjs/microservices';

import { InterfaceManagerService } from './interface-manager.service';
import {
  SERIAL_CLOSE_PATTERN,
  SERIAL_CONFIGURE_PATTERN,
  SERIAL_CONNECTION_PATTERN,
  SERIAL_LIST_PATTERN,
} from './interface.constants';
import { SerialCloseProps, SerialProps } from './interface.types';

@Controller()
export class SerialInterfaceController {
  private readonly logger = new Logger(SerialInterfaceController.name);

  constructor(private readonly interfaceManager: InterfaceManagerService) {}

  @MessagePattern(SERIAL_LIST_PATTERN)
  async listSerialPorts(@Ctx() context: MqttContext) {
    this.logger.debug(`Topic: ${context.getTopic()}`);
    this.logger.log(`Publising serial ports avalaibles`);

    await this.interfaceManager.publishSerialPorts();
  }

  @MessagePattern(SERIAL_CONFIGURE_PATTERN)
  async configureUsb(
    @Payload() data: SerialProps,
    @Ctx() context: MqttContext
  ) {
    this.logger.debug(`Topic: ${context.getTopic()}`);
    const { path, baudRate } = data;
    this.logger.log(`Configuring serial interface '${path}'`);
    await this.interfaceManager.initializeSerialInterface(path, baudRate);
  }

  @MessagePattern(SERIAL_CLOSE_PATTERN)
  configureUsbClose(
    @Payload() data: SerialCloseProps,
    @Ctx() context: MqttContext
  ) {
    this.logger.debug(`Topic: ${context.getTopic()}`);
    const { path } = data;
    this.logger.log(`Closing serial interface '${path}'`);
    this.interfaceManager.closeSerialDevice(path);
  }

  @MessagePattern(SERIAL_CONNECTION_PATTERN)
  lisSerialConnections(@Ctx() context: MqttContext) {
    this.logger.debug(`Topic: ${context.getTopic()}`);
    this.logger.log(`Publising serial list connections`);
    this.interfaceManager.publishSerialConnections();
  }
}
