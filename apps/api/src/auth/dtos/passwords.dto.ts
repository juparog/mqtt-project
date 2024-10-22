import { PASSWORD_REGEX } from '@kuiiksoft/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches, MinLength } from 'class-validator';

export abstract class PasswordsDto {
  @ApiProperty({
    description: 'New password',
    example: 'password',
  })
  @IsString()
  @Length(8, 35)
  @Matches(PASSWORD_REGEX, {
    message:
      'Password requires a lowercase letter, an uppercase letter, and a number or symbol',
  })
  password1!: string;

  @ApiProperty({
    description: 'New password confirmation',
    example: 'password',
  })
  @IsString()
  @MinLength(1)
  password2!: string;
}
