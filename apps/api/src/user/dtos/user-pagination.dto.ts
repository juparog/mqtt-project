import { PaginationDto } from '@kuiiksoft/common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UserPaginationDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filter by first name',
    example: 'John',
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Filter by last name',
    example: 'Doe',
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Filter by username',
    example: 'johndoe',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: 'Filter by email',
    example: 'true',
  })
  @IsString()
  @IsOptional()
  isActive?: string;
}
