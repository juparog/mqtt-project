import { Injectable, Logger } from '@nestjs/common';
import {
  FindManyOptions,
  FindOptionsOrder,
  FindOptionsWhere,
  ILike,
  Repository,
} from 'typeorm';

import { PaginationDto } from './pagination.dto';

@Injectable()
export class PaginationService {
  private readonly logger = new Logger(PaginationService.name);
  async paginate<T extends object>(
    repository: Repository<T>,
    query: PaginationDto & (FindOptionsWhere<T>[] | FindOptionsWhere<T>)
  ) {
    this.logger.log('Paginating...');

    const { page = 1, limit, orderBy, sort, ...rest } = query;
    const take = limit;
    const skip = (page - 1) * take;
    const order = (orderBy ? { [orderBy]: sort } : {}) as FindOptionsOrder<T>;

    let where = {};
    const entityMetadata = repository.metadata;
    Object.keys(rest).forEach((key) => {
      if (key in rest) {
        const columnMetadata = entityMetadata.findColumnWithPropertyPath(key);
        if (
          columnMetadata &&
          (columnMetadata.type === 'varchar' || columnMetadata.type === 'text')
        ) {
          where = { ...where, [key]: ILike(`%${rest[key]}%`) };
        } else {
          where = { ...where, [key]: rest[key] };
        }
      }
    });

    const pagination: FindManyOptions<T> = {
      take,
      skip,
      order,
      where,
    };

    return repository.findAndCount(pagination);
  }
}
