import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

import { ConfigModule, ConfigService } from '@kuiiksoft/core/config';

import { AgentModule } from '../agent';
import { AuthModule } from '../auth';
import { DeviceModule } from '../device';
import { UserModule } from '../user';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const dbConfig = configService.getDbConfig();
        return {
          type: dbConfig.type,
          database: dbConfig.name,
          host: dbConfig.host,
          port: dbConfig.port,
          username: dbConfig.username,
          password: dbConfig.password,
          ssl: dbConfig.ssl,
          synchronize: dbConfig.synchronize,
          logging: dbConfig.logging,
          autoLoadEntities: true,
        } as TypeOrmModuleOptions;
      },
      inject: [ConfigService],
    }),
    UserModule,
    AuthModule,
    DeviceModule,
    AgentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
