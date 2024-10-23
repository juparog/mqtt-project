import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PaginationService, stringToBoolean } from '@kuiiksoft/common';
import { CreateUserDto, UserPaginationDto } from './dtos';
import { UserEntity } from './user.entity';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private paginationService: PaginationService
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserEntity> {
    const existingUser = await this.userRepository.findByEmail(
      createUserDto.email
    );
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const existingUsername = await this.userRepository.findByUsername(
      createUserDto.username
    );
    if (existingUsername) {
      throw new ConflictException('Username already in use');
    }

    const user = await this.userRepository.createUser({
      ...createUserDto,
      confirmed: false,
    });

    return user;
  }

  async findById(id: string, auth?: boolean): Promise<UserEntity> {
    const user = await this.userRepository.findById(id, auth);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string, auth?: boolean): Promise<UserEntity> {
    const user = await this.userRepository.findByEmail(email, auth);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByUsername(username: string, auth?: boolean): Promise<UserEntity> {
    const user = await this.userRepository.findByUsername(username, auth);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmailOrUsername(
    emailOrUsername: string,
    auth?: boolean
  ): Promise<UserEntity> {
    const user = await this.userRepository.findByEmailOrUsername(
      emailOrUsername,
      auth
    );
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findPaginated(
    query?: UserPaginationDto
  ): Promise<[UserEntity[], number]> {
    return this.paginationService.paginate<UserEntity>(this.userRepository, {
      ...query,
      isActive: stringToBoolean(query.isActive || 'true'),
    });
  }

  async findOrCreate(email: string, user: UserEntity): Promise<UserEntity> {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      return existingUser;
    }
    return await this.userRepository.createUser(user);
  }

  async updatePassword(
    userId: string,
    password: string,
    newPassword: string
  ): Promise<UserEntity> {
    const user = await this.findById(userId.toString());
    if (!user.comparePassword(password, user.password)) {
      throw new ConflictException('Invalid password');
    }
    user.password = newPassword;
    return this.userRepository.save(user);
  }

  async updateConfirmed(id: string): Promise<boolean> {
    const updated = await this.userRepository.update(id, { confirmed: true });
    return updated.affected > 0 ? true : false;
  }
}
