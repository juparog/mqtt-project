import { Logger } from '@nestjs/common';
import { ReadlineParser, SerialPort } from 'serialport';
import { SerialProps } from '../app.types';
import { MqttCustomStrategy } from '../mqtt.strategy';

export class SerialInterface {
  private readonly logger = new Logger(SerialInterface.name);

  private serialport: SerialPort;
  private parser: ReadlineParser;

  constructor(
    private readonly mqttService: MqttCustomStrategy,
    private readonly props: SerialProps
  ) {
    const { path, baudRate } = props;
    this.serialport = new SerialPort({ path, baudRate });
    this.parser = this.serialport.pipe(
      new ReadlineParser({ delimiter: '\r\n' })
    );

    this.initialize();
  }

  public initialize() {
    const { path } = this.props;

    this.serialport.on('open', () => {
      this.logger.debug(`Serial Port '${path}' is opened`);

      this.mqttService.publish(
        `device/interface/serial/${path}/status`,
        { status: 'open' },
        { retain: true }
      );
    });

    this.parser.on('data', (data) => {
      this.mqttService.publish(
        `device/interface/serial/${path}/data`,
        JSON.stringify({ data })
      );
    });

    this.serialport.on('close', () => {
      this.mqttService.publish(
        `device/interface/serial/${path}/disconnected`,
        JSON.stringify({ path })
      );

      this.mqttService.publish(
        `device/interface/serial/${path}/status`,
        { status: 'close' },
        { retain: true }
      );
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
        } else {
          this.logger.debug(`Serial Port '${this.serialport.path}' is closed`);
        }
      });
    }
  }
}
