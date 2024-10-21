import { ApiProperty } from '@nestjs/swagger';

export class Paginated<T> {
  readonly count: number;
  readonly limit: number;
  readonly page: number;
  readonly data: readonly T[];

  constructor(props: Paginated<T>) {
    this.count = props.count;
    this.limit = props.limit;
    this.page = props.page;
    this.data = props.data;
  }
}

export abstract class PaginatedResponseDto<T> extends Paginated<T> {
  @ApiProperty({
    description: 'The number of items in the response',
    example: 10,
  })
  readonly count: number;

  @ApiProperty({
    description: 'The number of items per page',
    example: 10,
  })
  readonly limit: number;

  @ApiProperty({
    description: 'The current page number',
    example: 1,
  })
  readonly page: number;

  @ApiProperty({
    description: 'The items in the response',
    type: [Object],
  })
  readonly data: readonly T[];
}
