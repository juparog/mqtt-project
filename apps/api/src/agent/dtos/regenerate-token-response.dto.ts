import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class RegenerateTokenResponseDto {
  constructor(data: RegenerateTokenResponseDto) {
    this.agentId = data.agentId;
    this.newToken = data.newToken;
  }

  @ApiProperty({
    description: 'Id of the agent',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @IsUUID()
  agentId: string;

  @ApiProperty({
    description: 'New token for the agent',
    example: 'sk_new_ABCDEFGH1234567890xyz',
  })
  @IsString()
  newToken: string;
}
