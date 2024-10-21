import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import { DATABASE_MODULE_OPTIONS } from './database.constants';
import {
  DatabaseModuleAsyncOptions,
  DatabaseModuleFactory,
  DatabaseModuleOptions,
} from './database.options';
import { DatabaseService } from './database.service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useClass: DatabaseService,
      inject: [DATABASE_MODULE_OPTIONS],
    }),
  ],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {
  static forRoot(options?: DatabaseModuleOptions) {
    return {
      module: DatabaseModule,
      providers: [{ provide: DATABASE_MODULE_OPTIONS, useValue: options }],
    };
  }

  static forRootAsync(options: DatabaseModuleAsyncOptions) {
    if (options.useFactory) {
      return {
        module: DatabaseModule,
        providers: [
          {
            provide: DATABASE_MODULE_OPTIONS,
            useFactory: options.useFactory,
            inject: options.inject,
          },
        ],
      };
    }

    return {
      module: DatabaseModule,
      providers: [
        {
          provide: DATABASE_MODULE_OPTIONS,
          useFactory: async (optionsFactory: DatabaseModuleFactory) =>
            await optionsFactory.createDatabaseOptions(),
          inject: [options.useExisting || options.useClass],
        },
      ],
    };
  }

  static forFeature(entities?: EntityClassOrSchema[]) {
    return TypeOrmModule.forFeature(entities);
  }
}
