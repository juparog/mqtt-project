import { Controller, Logger } from '@nestjs/common';

import {
  Ctx,
  MessagePattern,
  MqttContext,
  Payload,
} from '@nestjs/microservices';
import { AGENT_INTERFACES } from '../app.constants';
import { SerialCloseProps, SerialProps } from '../app.types';
import { InterfaceManagerService } from '../services';

@Controller()
export class SerialInterfaceController {
  private readonly logger = new Logger(SerialInterfaceController.name);

  constructor(private readonly interfaceManager: InterfaceManagerService) {}

  @MessagePattern(`interface/${AGENT_INTERFACES.SERIAL}/configure`)
  async configureUsb(
    @Payload() data: SerialProps,
    @Ctx() context: MqttContext
  ) {
    this.logger.debug(`Topic: ${context.getTopic()}`);

    const { path, baudRate } = data;
    this.logger.log(`Configuring serial interface '${path}'`);
    await this.interfaceManager.initializeUsbInterface(path, baudRate);
  }

  @MessagePattern(`interface/${AGENT_INTERFACES.SERIAL}/close`)
  configureUsbClose(
    @Payload() data: SerialCloseProps,
    @Ctx() context: MqttContext
  ) {
    this.logger.debug(`Topic: ${context.getTopic()}`);

    const { path } = data;
    this.logger.log(`Closing serial interface '${path}'`);
    this.interfaceManager.closeUsbInterface(path);
  }
}
