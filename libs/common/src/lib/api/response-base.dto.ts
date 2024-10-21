import { ApiProperty } from '@nestjs/swagger';

import { IdResponse } from './id-response.dto';

export interface BaseResponseProps {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ResponseBaseDto extends IdResponse {
  constructor(props: BaseResponseProps) {
    super(props.id);
    this.createdAt = new Date(props.createdAt).toISOString();
    this.updatedAt = new Date(props.updatedAt).toISOString();
  }

  @ApiProperty({
    description: 'The date and time the resource was created',
    example: '2021-08-01T00:00:00.000Z',
  })
  readonly createdAt: string;

  @ApiProperty({
    description: 'The date and time the resource was last updated',
    example: '2021-08-01T00:00:00.000Z',
  })
  readonly updatedAt: string;

  @ApiProperty({
    description: 'Whether the resource is active',
    example: true,
    default: true,
  })
  readonly isActive: boolean;
}
