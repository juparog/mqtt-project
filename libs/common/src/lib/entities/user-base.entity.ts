import bcrypt from 'bcrypt';
import { BeforeInsert, BeforeUpdate, Column, Entity } from 'typeorm';

import { IBaseUser } from '../interfaces';
import { BaseEntity } from './base.entity';

@Entity()
export class UserBaseEntity extends BaseEntity implements IBaseUser {
  @Column({
    name: 'first_name',
    type: 'text',
  })
  firstName: string;

  @Column({
    name: 'last_name',
    type: 'text',
    nullable: true,
  })
  lastName?: string;

  @Column({
    type: 'text',
    unique: true,
  })
  email: string;

  @Column({
    type: 'text',
    nullable: true,
    select: false,
  })
  password?: string;

  @Column({
    name: 'needs_password_reset',
    type: 'boolean',
    default: true,
  })
  needsPasswordReset: boolean;

  @Column({
    type: 'boolean',
    default: false,
  })
  confirmed: boolean;

  @BeforeInsert()
  @BeforeUpdate()
  protected async encryptPassword(): Promise<void> {
    if (this.password) {
      const salt = await bcrypt.genSalt();
      this.password = await bcrypt.hash(this.password, salt);
      this.needsPasswordReset = false;
    }
  }

  async comparePassword(
    attempt: string,
    hashPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(attempt, hashPassword);
  }
}
