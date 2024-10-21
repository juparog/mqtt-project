import {
  InjectionToken,
  OptionalFactoryDependency,
  Type,
} from '@nestjs/common';

export interface DatabaseModuleOptions {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  synchronize?: boolean;
  logging?: boolean;
  ssl?: boolean;
}

export interface DatabaseModuleFactory {
  createDatabaseOptions():
    | DatabaseModuleOptions
    | Promise<DatabaseModuleOptions>;
}

export interface DatabaseModuleAsyncOptions {
  useExisting?: Type<DatabaseModuleFactory>;
  useClass?: Type<DatabaseModuleFactory>;
  useFactory?: (
    ...args: unknown[]
  ) => DatabaseModuleOptions | Promise<DatabaseModuleOptions>;
  inject?: (InjectionToken | OptionalFactoryDependency)[];
}
