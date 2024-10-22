import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateAgentDto {
  @ApiProperty({
    description: 'Agent name',
    example: 'Agent 1',
  })
  @IsString()
  @Length(3, 106)
  name: string;

  @ApiProperty({
    description: 'Agent description',
    example: 'Agent 1 description',
  })
  @IsString()
  @IsNotEmpty()
  description: string;
}
