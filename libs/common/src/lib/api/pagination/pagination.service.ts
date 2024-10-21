import { Injectable, Logger } from '@nestjs/common';
import { FindManyOptions, FindOptionsOrder, ILike, Repository } from 'typeorm';

import { PaginationDto } from './pagination.dto';

@Injectable()
export class PaginationService {
  private readonly logger = new Logger(PaginationService.name);
  async paginate<T extends object>(
    repository: Repository<T>,
    query: PaginationDto
  ) {
    this.logger.log('Paginating...');

    const { page = 1, limit, orderBy, sort, ...rest } = query;
    const take = limit;
    const skip = (page - 1) * take;
    const order = (orderBy ? { [orderBy]: sort } : {}) as FindOptionsOrder<T>;

    let where = {};
    Object.keys(rest).forEach((key) => {
      if (key in rest) {
        where = { ...where, [key]: ILike(`%${(rest as any)[key]}%`) }; // eslint-disable-line
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
