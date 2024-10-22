import { PASSWORD_REGEX, SLUG_REGEX } from '@kuiiksoft/common';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'User first name',
    example: 'John',
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    description: 'User email',
    example: 'jhon@email.com',
  })
  @IsEmail()
  @Length(5, 255)
  email: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({
    description: 'User username',
    example: 'jhon_doe',
    required: false,
  })
  @IsOptional()
  @Length(3, 106)
  @Matches(SLUG_REGEX, {
    message: 'Username must be a valid slugs',
  })
  username?: string;

  @ApiProperty({
    description: 'User password',
    example: 'password',
    required: false,
  })
  @IsString()
  @Length(8, 35)
  @Matches(PASSWORD_REGEX, {
    message:
      'Password requires a lowercase letter, an uppercase letter, and a number or symbol',
  })
  password?: string;

  @ApiProperty({
    description: 'User avatar',
    example: 'https://www.example.com/avatar.png',
    required: false,
  })
  @IsOptional()
  @IsString()
  avatar?: string;
}
