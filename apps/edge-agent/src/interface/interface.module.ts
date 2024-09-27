import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { MQTT_TRANSPORT } from '../app/app.constants';
import { MqttCustomStrategy } from '../mqtt.strategy';
import { InterfaceManagerService } from './interface-manager.service';
import { SerialInterfaceController } from './serial-interface.controller';

@Module({
  imports: [EventEmitterModule.forRoot()],
  controllers: [SerialInterfaceController],
  providers: [InterfaceManagerService],
})
export class InterfaceModule {
  static forRoot(options: { mqttClient: MqttCustomStrategy }) {
    return {
      module: InterfaceModule,
      providers: [
        {
          provide: MQTT_TRANSPORT,
          useValue: options.mqttClient,
        },
      ],
    };
  }
}
