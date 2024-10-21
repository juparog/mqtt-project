import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { IPagination, PaginationSort } from './pagination.types';

export class PaginationDto implements IPagination {
  @ApiProperty({
    type: Number,
    description: 'The page number',
    default: 1,
  })
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => parseInt(value, 10))
  page = 1;

  @ApiProperty({
    type: Number,
    description: 'The limit of items per page',
    default: 10,
  })
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => parseInt(value, 10))
  limit = 10;

  @ApiProperty({
    type: String,
    description: 'The field to order by',
    default: 'createdAt',
  })
  @IsString()
  @IsOptional()
  orderBy?: string = 'createdAt';

  @ApiProperty({
    enum: PaginationSort,
    description: 'The sort order',
    default: PaginationSort.DESC,
  })
  @IsEnum(PaginationSort)
  @IsOptional()
  sort?: PaginationSort = PaginationSort.DESC;
}
