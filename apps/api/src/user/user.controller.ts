import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CreateUserDto, UsersPaginatedDto } from './dtos';
import { UserPaginationDto } from './dtos/user-pagination.dt';
import { UserResponseDto } from './dtos/user-response.dto';
import { UserService } from './user.service';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(
    @Body() createUserDto: CreateUserDto
  ): Promise<UserResponseDto> {
    const userSaved = await this.userService.create(createUserDto);
    return new UserResponseDto({
      id: userSaved.id,
      username: userSaved.username,
      email: userSaved.email,
      firstName: userSaved.firstName,
      lastName: userSaved.lastName,
      needsPasswordReset: userSaved.needsPasswordReset,
      confirmed: userSaved.confirmed,
      isActive: userSaved.isActive,
      avatar: userSaved.avatar,
      createdAt: userSaved.createdAt,
      updatedAt: userSaved.updatedAt,
    });
  }

  @Get()
  async getUsers(
    @Query() query: UserPaginationDto
  ): Promise<UsersPaginatedDto> {
    const [users, count] = await this.userService.findAllPaginated(query);
    return new UsersPaginatedDto({
      ...query,
      count,
      data: users.map(
        (user) =>
          new UserResponseDto({
            id: user.id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            needsPasswordReset: user.needsPasswordReset,
            confirmed: user.confirmed,
            isActive: user.isActive,
            avatar: user.avatar,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          })
      ),
    });
  }

  // @Get(':id')
  // async getUserById(@Param('id') id: string): Promise<UserEntity> {
  //   return this.userService.getUserById(id);
  // }
}
