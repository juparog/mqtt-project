import { IUser, ResponseBaseDto } from '@kuiiksoft/common';
import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto
  extends ResponseBaseDto
  implements Omit<IUser, 'password' | 'createdAt' | 'updatedAt'>
{
  constructor(user: Omit<IUser, 'password'>) {
    super({
      id: user.id,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      isActive: user.isActive,
    });
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.username = user.username;
    this.email = user.email;
    this.needsPasswordReset = user.needsPasswordReset;
    this.confirmed = user.confirmed;
    this.avatar = user.avatar;
  }

  @ApiProperty({
    description: 'User first name',
    example: 'John',
  })
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    required: false,
  })
  lastName?: string;

  @ApiProperty({
    description: 'User username',
    example: 'jhon_doe',
    required: false,
  })
  username?: string;

  @ApiProperty({
    description: 'User email',
    example: 'jhon@email.com',
  })
  email: string;

  @ApiProperty({
    description: 'User needs password reset',
    example: false,
  })
  needsPasswordReset: boolean;

  @ApiProperty({
    description: 'User is confirmed',
    example: true,
  })
  confirmed: boolean;

  @ApiProperty({
    description: 'User avatar',
    example: 'https://www.example.com/avatar.png',
    required: false,
  })
  avatar?: string;

  @ApiProperty({
    description: 'User is active',
    example: true,
  })
  isActive: boolean;
}
