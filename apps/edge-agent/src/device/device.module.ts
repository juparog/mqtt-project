import { Module } from '@nestjs/common';
import { DeviceController } from './device.controller';
import { DeviceFactory } from './device.factory';
import { DeviceManager } from './device.manager';
import { SerialDevice } from './serial/serial.device';

@Module({
  imports: [],
  controllers: [DeviceController],
  providers: [
    DeviceFactory,
    DeviceManager,
    {
      provide: 'FACTORY_REGISTER',
      useFactory: (factory: DeviceFactory) => {
        factory.register([SerialDevice]);
      },
      inject: [DeviceFactory],
    },
  ],
})
export class DeviceModule {}
