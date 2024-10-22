import { RepositoryBase } from '@kuiiksoft/common';
import { Injectable } from '@nestjs/common';
import { EntityManager, FindOptionsSelect } from 'typeorm';
import { UserEntity } from './user.entity';

@Injectable()
export class UserRepository extends RepositoryBase<UserEntity> {
  constructor(manager: EntityManager) {
    super(UserEntity, manager);
  }

  async createUser(user: Partial<UserEntity>): Promise<UserEntity> {
    const newUser = this.create(user);
    return this.save(newUser);
  }

  async findById(id: string, auth?: boolean): Promise<UserEntity | null> {
    return this.findOne({
      where: { id: String(id) },
      select: this.getSelectOptions(auth),
    });
  }

  async findByEmail(email: string, auth?: boolean): Promise<UserEntity | null> {
    return this.findOne({
      where: { email: String(email) },
      select: this.getSelectOptions(auth),
    });
  }

  async findByUsername(
    username: string,
    auth?: boolean
  ): Promise<UserEntity | null> {
    return this.findOne({
      where: { username: String(username) },
      select: this.getSelectOptions(auth),
    });
  }

  async findByEmailOrUsername(
    emailOrUsername: string,
    auth?: boolean
  ): Promise<UserEntity | null> {
    return this.findOne({
      where: [
        { email: String(emailOrUsername) },
        { username: String(emailOrUsername) },
      ],
      select: this.getSelectOptions(auth),
    });
  }

  private getSelectOptions(auth?: boolean): FindOptionsSelect<UserEntity> {
    const select: FindOptionsSelect<UserEntity> = {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      username: true,
      confirmed: true,
      needsPasswordReset: true,
      avatar: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    };
    if (auth) {
      select.password = true;
    }
    return select;
  }
}
