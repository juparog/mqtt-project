import { BaseEntity, IDevice } from '@kuiiksoft/common';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { AgentEntity } from '../agent';

@Entity('devices')
export class DeviceEntity extends BaseEntity implements IDevice {
  @Column({
    type: 'text',
  })
  name: string;

  @Column({
    type: 'text',
  })
  description: string;

  @Column({
    type: 'text',
  })
  type: string;

  @Column({
    type: 'text',
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active',
  })
  status: 'active' | 'inactive' | 'maintenance';

  @ManyToOne(() => AgentEntity, (agent) => agent.devices)
  agent: AgentEntity;

  @RelationId((device: DeviceEntity) => device.agent)
  agentId: string;

  @Column({
    type: 'jsonb',
  })
  metadata: Record<string, unknown>;
}
