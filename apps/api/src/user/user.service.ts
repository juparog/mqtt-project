import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PaginationDto, PaginationService } from '@kuiiksoft/common';
import { CreateUserDto } from './dtos';
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

  async findById(id: string): Promise<UserEntity> {
    const user = await this.userRepository.findOneBy({ id });
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

  async findAllPaginated(
    query?: PaginationDto
  ): Promise<[UserEntity[], number]> {
    return this.paginationService.paginate<UserEntity>(
      this.userRepository,
      query
    );
  }

  async findOrCreate(email: string, user: UserEntity): Promise<UserEntity> {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      return existingUser;
    }
    return await this.userRepository.createUser(user);
  }
}
