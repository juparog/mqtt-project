import {
  EntityManager,
  EntityTarget,
  FindOptionsWhere,
  Repository,
} from 'typeorm';

export abstract class RepositoryBase<T> extends Repository<T> {
  constructor(target: EntityTarget<T>, manager: EntityManager) {
    super(target, manager);
  }

  async findByField(field: keyof T, value: unknown): Promise<T | undefined> {
    const where = { [field]: value } as
      | FindOptionsWhere<T>
      | FindOptionsWhere<T>[];
    return this.findOne({ where });
  }

  async countByField(field: keyof T, value: unknown): Promise<number> {
    const where = { [field]: value } as
      | FindOptionsWhere<T>
      | FindOptionsWhere<T>[];
    return this.count({ where });
  }

  async findAllPaginated(page: number, limit: number): Promise<[T[], number]> {
    const [items, total] = await this.findAndCount({
      take: limit,
      skip: (page - 1) * limit,
    });
    return [items, total];
  }
}
