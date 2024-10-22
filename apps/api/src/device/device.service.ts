import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeviceEntity } from './device.entity';

@Injectable()
export class DeviceService {
  constructor(
    @InjectRepository(DeviceEntity)
    private readonly DeviceRepository: Repository<DeviceEntity>
  ) {}

  async createDevice(
    name: string,
    description?: string
  ): Promise<DeviceEntity> {
    const Device = new DeviceEntity();
    Device.name = name;
    Device.description = description;
    return this.DeviceRepository.save(Device);
  }
}
