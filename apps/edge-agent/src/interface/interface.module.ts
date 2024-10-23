import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { InterfaceManagerService } from './interface-manager.service';
import { SerialInterfaceController } from './serial/serial-interface.controller';

@Module({
  imports: [EventEmitterModule.forRoot()],
  controllers: [SerialInterfaceController],
  providers: [InterfaceManagerService],
})
export class InterfaceModule {}
