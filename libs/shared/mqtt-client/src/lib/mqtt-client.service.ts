import { Inject, Injectable, Logger } from '@nestjs/common';
import { MessageHandler, MqttOptions, ServerMqtt } from '@nestjs/microservices';
import { MqttClient } from '@nestjs/microservices/external/mqtt-client.interface';
import { IClientPublishOptions } from 'mqtt';
import path from 'path';

import { MQTTCLIENT_OPTION_MODULE } from './mqtt-client.constants';
import { MqttClientModuleOptions } from './mqtt-client.interfaces';

@Injectable()
export class MqttClientService extends ServerMqtt {
  protected override readonly logger = new Logger(MqttClientService.name);

  constructor(
    @Inject(MQTTCLIENT_OPTION_MODULE) options: MqttClientModuleOptions
  ) {
    super(options);
  }

  publish(topic: string, message: unknown, options?: IClientPublishOptions) {
    const { clientId } = this.mqttClient.options;
    this.mqttClient.publish(
      `agent/${clientId}/${topic}`,
      JSON.stringify(message),
      options
    );
  }

  subscribe(topic: string, callback: (message: string) => void) {
    const { clientId } = this.mqttClient.options;
    const fullTopic = `agent/${clientId}/${topic}`;
    this.mqttClient.subscribe(fullTopic);
    this.mqttClient.on('message', (topic: string, message: string) => {
      if (topic === fullTopic) {
        callback(message.toString());
      }
    });
  }

  getOptions(): MqttOptions['options'] {
    return this.mqttClient?.options;
  }

  override bindEvents(mqttClient: MqttClient) {
    // se sobrescribe el mapa que contiene las keys para los manejadores de mensajes
    // para agrear un prefijo que identifique el agente
    const { clientId, url: brokerUrl } = this.mqttClient.options;
    const prefixPattern = `agent/${clientId}`;
    this.addPrefixToMapKeys(prefixPattern);

    super.bindEvents(mqttClient);

    mqttClient.on('connect', async () => {
      this.logger.log(`Agent with id '${clientId}' connected to MQTT broker`);
      this.logger.debug(`Publishing 'status'and 'info' of agent`);
      this.publish('status', { status: 'online', clientId });
      this.publish('info', { clientId, brokerUrl }, { retain: true });
    });

    mqttClient.on('reconnect', () =>
      this.logger.error('Broker connection error, reconnecting...')
    );
  }

  private addPrefixToMapKeys(prefix: string): void {
    const updatedMap = new Map<string, MessageHandler>();
    for (const [key, value] of this.messageHandlers.entries()) {
      const newKey = path.join(prefix, key).replaceAll('\\', '/');
      updatedMap.set(newKey, value);
      this.logger.log(`Mapped ${newKey} topic`);
    }
    (
      this as unknown as { messageHandlers: Map<string, MessageHandler> }
    ).messageHandlers = updatedMap;
  }
}
