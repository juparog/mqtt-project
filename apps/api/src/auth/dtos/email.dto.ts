import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from 'class-validator';

export abstract class EmailDto {
  @ApiProperty({
    description: 'User email',
    example: 'jhon@email.com',
  })
  @IsString()
  @IsEmail()
  @Length(5, 255)
  public email: string;
}
