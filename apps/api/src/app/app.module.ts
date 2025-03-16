import KeyvRedis from '@keyv/redis';
import { ConfigModule, ConfigService } from '@kuiiksoft/core/config';
import { CacheModule, CacheStore } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
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
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: (configService: ConfigService) => {
        const config = configService.getCacheConfig();
        const redisStore = new KeyvRedis({
          url: `${config.schema}://${config.host}:${config.port}`,
          password: config.password,
          socket: {
            reconnectStrategy: (retries) =>
              Math.min(retries * config.reconnectTime, 2000),
            tls: config.tls,
            keepAlive: config.keepAlive,
          },
        });
        redisStore['del'] = redisStore.delete;
        return {
          store: redisStore as unknown as CacheStore,
          ttl: config.ttl,
        };
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
