import { PaginationDto } from '@kuiiksoft/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

export class AgentPaginationDto extends PaginationDto {
  @ApiProperty({
    description: 'Agent name',
    example: 'Agent 1',
  })
  @IsString()
  @Length(3, 106)
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Filter by email',
    example: 'true',
  })
  @IsString()
  @IsOptional()
  isActive?: string;
}
