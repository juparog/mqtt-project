import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import {
  CreateUserDto,
  UserPaginationDto,
  UserResponseDto,
  UsersPaginatedDto,
} from './dtos';
import { UserService } from './user.service';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(
    @Body() createUserDto: CreateUserDto
  ): Promise<UserResponseDto> {
    const userCreated = await this.userService.create(createUserDto);
    return new UserResponseDto(userCreated);
  }

  @Get()
  async getUsers(
    @Query() query: UserPaginationDto
  ): Promise<UsersPaginatedDto> {
    const [users, count] = await this.userService.findPaginated(query);
    return new UsersPaginatedDto({
      ...query,
      count,
      data: users.map((user) => new UserResponseDto(user)),
    });
  }

  // @Get(':id')
  // async getUserById(@Param('id') id: string): Promise<UserEntity> {
  //   return this.userService.getUserById(id);
  // }
}
