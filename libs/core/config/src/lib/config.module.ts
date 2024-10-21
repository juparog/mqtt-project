import { Global, Module } from '@nestjs/common';
import { ENV_CONFIG_PROVIDER, YAML_CONFIG_PROVIDER } from './config.constants';
import { EnvProvider, YamlProvider } from './config.providers';
import { ConfigService } from './config.service';

@Global()
@Module({
  controllers: [],
  providers: [
    {
      provide: YAML_CONFIG_PROVIDER,
      useClass: YamlProvider,
    },
    {
      provide: ENV_CONFIG_PROVIDER,
      useClass: EnvProvider,
    },
    ConfigService,
  ],
  exports: [ConfigService],
})
export class ConfigModule {}
