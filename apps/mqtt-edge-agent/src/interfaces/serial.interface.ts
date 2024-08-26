import { Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PortInfo } from '@serialport/bindings-interface';
import { ReadlineParser, SerialPort } from 'serialport';

import {
  SERIAL_DEVICE_DATA_TOPIC,
  SERIAL_DEVICE_ERROR_TOPIC,
  SERIAL_DEVICE_STATUS_TOPIC,
  SERIALPORT_DISCONNECT_EVENT,
} from '../app.constants';
import { SerialProps } from '../app.types';
import { MqttCustomStrategy } from '../mqtt.strategy';

export class SerialInterface {
  private readonly logger = new Logger(SerialInterface.name);

  private serialport: SerialPort;
  private parser: ReadlineParser;

  constructor(
    private readonly mqttService: MqttCustomStrategy,
    private readonly props: SerialProps,
    private eventEmitter: EventEmitter2
  ) {
    const { path, baudRate } = props;
    this.serialport = new SerialPort({ path, baudRate });
    this.parser = this.serialport.pipe(
      new ReadlineParser({ delimiter: '\r\n' })
    );

    this.initialize();
  }

  static portsList(): Promise<PortInfo[]> {
    return SerialPort.list();
  }

  public initialize() {
    const { path } = this.props;

    this.serialport.on('open', () => {
      this.logger.debug(`Serial Port '${path}' is opened`);

      this.mqttService.publish(
        SERIAL_DEVICE_STATUS_TOPIC`${path}`,
        { status: 'open' },
        { retain: true }
      );
    });

    this.parser.on('data', (data) => {
      this.mqttService.publish(SERIAL_DEVICE_DATA_TOPIC`${path}`, {
        data,
      });
    });

    this.serialport.on('close', () => {
      this.eventEmitter.emit(SERIALPORT_DISCONNECT_EVENT, { path });

      this.mqttService.publish(
        SERIAL_DEVICE_STATUS_TOPIC`${path}`,
        { status: 'close' },
        { retain: true }
      );
    });

    this.serialport.on('error', (err) => {
      this.mqttService.publish(SERIAL_DEVICE_ERROR_TOPIC`${path}`, {
        message:
          err?.message ||
          `Error in serialport '${this.serialport.path}' connection`,
        stack: err?.stack || err,
      });
    });
  }

  public sendCommand(command: string) {
    this.serialport.write(command);
  }

  public close() {
    if (this.serialport.isOpen) {
      this.serialport.close((err) => {
        if (err) {
          this.logger.error(`Error closing the port '${this.serialport.path}'`);
          this.logger.debug(err?.message || err);
        }
      });
    }
    this.logger.debug(`Serial Port '${this.serialport.path}' is closed`);
  }
}
