import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { ConfigProps } from './config.interface';

@Injectable()
export class ConfigService {
  constructor(private readonly nestConfigService: NestConfigService) {}

  private toEnvKey(key: string): string {
    return `KS_${key.toUpperCase().replace(/\./g, '_')}`;
  }

  private getConfigString(key: string, defaultValue = ''): string {
    return (
      this.nestConfigService.get<string>(key) ||
      process.env[this.toEnvKey(key)] ||
      defaultValue
    );
  }

  private getConfigNumber(key: string, defaultValue = 0): number {
    return (
      this.nestConfigService.get<number>(key) ||
      Number(process.env[this.toEnvKey(key)]) ||
      defaultValue
    );
  }

  private getConfigBoolean(key: string, defaultValue = false): boolean {
    return (
      this.nestConfigService.get<boolean>(key) ||
      String(process.env[this.toEnvKey(key)]).toLowerCase() === 'true' ||
      defaultValue
    );
  }

  private getConfigObject<T>(key: string, defaultValue: T): T {
    const envValue = process.env[this.toEnvKey(key)];
    const envValueOrDefault = envValue
      ? (JSON.parse(envValue) as T)
      : defaultValue;
    return this.nestConfigService.get<T>(key) || envValueOrDefault;
  }

  getConfig(): ConfigProps {
    return {
      edgeAgent: {
        broker: {
          url: this.getConfigString(
            'edgeAgent.broker.url',
            'mqtt://localhost:1883'
          ),
        },
        client: {
          id: this.getConfigString('edgeAgent.client.id'),
          token: this.getConfigString('edgeAgent.client.token'),

          qos: this.getConfigNumber('edgeAgent.client.qos', 1),
        },
      },
    };
  }
}
