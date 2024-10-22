import { RepositoryBase } from '@kuiiksoft/common';
import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { DeviceEntity } from './device.entity';

@Injectable()
export class DeviceRepository extends RepositoryBase<DeviceEntity> {
  constructor(manager: EntityManager) {
    super(DeviceEntity, manager);
  }

  async createDevice(Device: Partial<DeviceEntity>): Promise<DeviceEntity> {
    const newDevice = this.create(Device);
    return this.save(newDevice);
  }
}
