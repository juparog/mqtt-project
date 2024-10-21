import { Inject, Injectable, Logger } from '@nestjs/common';
import Aedes from 'aedes';

import { MQTTBROKER_INSTANCE } from './mqtt-broker.constants';
import { PubPacket } from './mqtt-broker.interfaces';

@Injectable()
export class MqttBrokerService {
  private readonly logger = new Logger(MqttBrokerService.name);

  constructor(@Inject(MQTTBROKER_INSTANCE) private readonly broker: Aedes) {}

  async publish(packet: PubPacket): Promise<PubPacket> {
    return new Promise((resolve, reject) => {
      this.broker.publish(packet, (error) => {
        if (!error) {
          this.logger.debug(`Message published to topic ${packet.topic}`);
          return resolve(packet);
        }

        this.logger.error(
          `Error publishing message to topic ${packet.topic}: ${error?.message}`
        );
        this.logger.debug(error);
        return reject(error);
      });
    });
  }

  async close(): Promise<string> {
    this.logger.log('Closing Broker...');
    return new Promise((resolve) => {
      this.broker.close(() => {
        this.logger.debug('Broker Closed.');
        resolve('success');
      });
    });
  }

  getBrokerInstance(): Aedes {
    return this.broker;
  }
}
