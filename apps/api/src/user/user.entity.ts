import { BaseUser, IUser } from '@kuiiksoft/common';
import { Column, Entity } from 'typeorm';

@Entity('users')
export class UserEntity extends BaseUser implements IUser {
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
}
