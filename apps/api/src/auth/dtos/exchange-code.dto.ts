import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export abstract class ExchangeCodeDto {
  @ApiProperty({
    description: 'Authorization code',
    example: 'ac_1234567890',
  })
  @IsString()
  @IsNotEmpty()
  public code: string;

  @ApiProperty({
    description: 'Code verifier',
    example: '1234567890',
  })
  @IsString()
  @IsNotEmpty()
  public codeVerifier: string;
}
