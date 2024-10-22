import { BaseEntity, generateToken, IAgent, IDevice } from '@kuiiksoft/common';
import {
  BeforeInsert,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { UserEntity } from '../user/user.entity';

@Entity('agents')
@Index(['name', 'userId'], { unique: true })
export class AgentEntity extends BaseEntity implements IAgent {
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
  token: string;

  @ManyToOne(() => UserEntity, (user) => user.agents)
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
  })
  user: UserEntity;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  devices?: IDevice[];

  @BeforeInsert()
  protected generateToken(): void {
    this.token = generateToken('at_');
  }
}
