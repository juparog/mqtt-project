import { ApiProperty } from '@nestjs/swagger';

export class MessageDto {
  @ApiProperty({
    description: 'The content of the message',
    example: 'Hello, this is a message!',
  })
  message: string;
}
