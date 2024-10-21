import { ApiProperty } from '@nestjs/swagger';

export class IdResponse {
  constructor(id: string) {
    this.id = id;
  }

  @ApiProperty({
    description: 'The unique identifier for the resource',
    example: '5f6f6a3b-7f3b-4c6d-8b7f-1c6d7f3b4c6d',
  })
  readonly id: string;
}
