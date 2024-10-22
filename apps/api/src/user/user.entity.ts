import { IUser, UserBaseEntity } from '@kuiiksoft/common';
import { Column, Entity, JoinColumn, OneToMany, RelationId } from 'typeorm';
import { AgentEntity } from '../agent/agent.entity';

@Entity('users')
export class UserEntity extends UserBaseEntity implements IUser {
  @Column({
    type: 'text',
    unique: true,
    nullable: true,
  })
  username?: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  avatar?: string;

  @OneToMany(() => AgentEntity, (agent) => agent.user)
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
  })
  agents: AgentEntity[];

  @RelationId((user: UserEntity) => user.agents)
  agentIds: string[];
}
