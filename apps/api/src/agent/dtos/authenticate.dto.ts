import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export abstract class AuthenticateDto {
  @ApiProperty({
    description: 'Agent ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsUUID()
  public agentId: string;

  @ApiProperty({
    description: 'Token for the agent',
    example: 'at_1234567890',
  })
  @IsString()
  @IsNotEmpty()
  public token: string;
}
