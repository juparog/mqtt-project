import { Inject, Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { DATABASE_MODULE_OPTIONS } from './database.constants';
import { DatabaseModuleOptions } from './database.options';

@Injectable()
export class DatabaseService implements TypeOrmOptionsFactory {
  constructor(
    @Inject(DATABASE_MODULE_OPTIONS) private options: DatabaseModuleOptions
  ) {}

  getDefaultOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      database: 'mqtt_project',
      username: 'admin',
      password: 'admin',
      autoLoadEntities: true,
      logging: false,
      retryAttempts: 5,
      retryDelay: 3000,
      migrationsTableName: 'migrations',
      synchronize: ['development', 'dev', 'test'].includes(
        String(process.env?.['NODE_ENV'])
      ),
    };
  }

  createTypeOrmOptions(): Promise<TypeOrmModuleOptions> | TypeOrmModuleOptions {
    return {
      ...this.getDefaultOptions(),
      ...this.options,
    } as TypeOrmModuleOptions;
  }
}
