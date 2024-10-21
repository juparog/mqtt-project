import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, MinLength } from 'class-validator';

export abstract class LoginDto {
  @ApiProperty({
    description: 'Email or username',
    examples: ['jhon_doe', 'jhon@email.com'],
  })
  @IsString()
  @Length(3, 106)
  public emailOrUsername: string;

  @ApiProperty({
    description: 'Password for the user',
    example: 'securePassword123',
  })
  @IsString()
  @MinLength(1)
  public password: string;
}
