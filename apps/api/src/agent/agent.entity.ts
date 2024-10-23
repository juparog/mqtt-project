import { BaseEntity, IAgent, IDevice } from '@kuiiksoft/common';
import bcrypt from 'bcrypt';
import {
  BeforeInsert,
  BeforeUpdate,
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
    select: false,
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
  @BeforeUpdate()
  protected async generateToken(): Promise<void> {
    if (this.token) {
      const salt = await bcrypt.genSalt();
      this.token = await bcrypt.hash(this.token, salt);
    }
  }

  async compareToken(attempt: string, hashToken: string): Promise<boolean> {
    return bcrypt.compare(attempt, hashToken);
  }
}
