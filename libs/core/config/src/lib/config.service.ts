import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { readFileSync } from 'node:fs';
import { v4 as uuidv4 } from 'uuid';

import { generateCode, generateRSAKeyPair, IConfig } from '@kuiiksoft/common';

import { ENV_CONFIG_PROVIDER, YAML_CONFIG_PROVIDER } from './config.constants';
import { IConfigProvider } from './config.interfaces';

@Injectable()
export class ConfigService implements OnModuleInit {
  private readonly logger = new Logger(ConfigService.name);
  constructor(
    @Inject(YAML_CONFIG_PROVIDER)
    private readonly yamlConfig: IConfigProvider,
    @Inject(ENV_CONFIG_PROVIDER)
    private readonly envConfig: IConfigProvider
  ) {}

  onModuleInit() {
    this.logger.log('ConfigService initialized');
  }

  private getConfigString(key: string, defaultValue = ''): string {
    return this.yamlConfig.get(key) || this.envConfig.get(key) || defaultValue;
  }

  private getConfigNumber(key: string, defaultValue = 0): number {
    return (
      this.yamlConfig.get(key) ||
      Number(this.envConfig.get(key)) ||
      defaultValue
    );
  }

  private getConfigBoolean(key: string, defaultValue = false): boolean {
    return (
      this.yamlConfig.get(key) ||
      String(this.envConfig.get(key)).toLowerCase() === 'true' ||
      defaultValue
    );
  }

  private getConfigObject<T>(key: string, defaultValue: T): T {
    const envValue = this.envConfig.get<string>(key);
    const envValueOrDefault = envValue
      ? (JSON.parse(envValue) as T)
      : defaultValue;
    return this.yamlConfig.get<T>(key) || envValueOrDefault;
  }

  private getConfigFromFile(
    key: string,
    defaultFile: string,
    defaultValue: string
  ): string {
    const file = this.getConfigString(key, defaultFile);
    try {
      return readFileSync(file, 'utf-8');
    } catch (error) {
      this.logger.debug(`Error reading config key ${file}: ${error}`);
      this.logger.debug('Return default value');
      return defaultValue;
    }
  }

  getConfig(): IConfig {
    const { privateKey, publicKey } = generateRSAKeyPair();
    return {
      id: this.getConfigString('id', uuidv4()),
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
          reconnectRetries: this.getConfigNumber(
            'edgeAgent.client.reconnectRetries',
            5
          ),
        },
      },
      broker: {
        port: {
          mqtt: this.getConfigNumber('broker.port.mqtt', 1883),
          http: this.getConfigNumber('broker.port.http', 8081),
          ws: this.getConfigNumber('broker.port.ws', 8082),
        },
        hostname: this.getConfigString('broker.hostname', '0.0.0.0'),
        id: this.getConfigString('broker.id', uuidv4()),
        transport: this.getConfigString('broker.transport', 'tcp'),
        concurrency: this.getConfigNumber('broker.concurrency', 1000),
        queueLimit: this.getConfigNumber('broker.queueLimit', 42),
        maxClientsIdLength: this.getConfigNumber(
          'broker.maxClientsIdLength',
          23
        ),
        connectTimeout: this.getConfigNumber('broker.connectTimeout', 30000),
        heartbeatInterval: this.getConfigNumber(
          'broker.heartbeatInterval',
          60000
        ),
      },
      db: {
        type: this.getConfigString('db.type', 'postgres'),
        host: this.getConfigString('db.host', '0.0.0.0'),
        port: this.getConfigNumber('db.port', 5432),
        name: this.getConfigString('db.name', 'mqtt_project'),
        username: this.getConfigString('db.username', 'admin'),
        password: this.getConfigString('db.password', 'admin'),
        synchronize: this.getConfigBoolean('db.synchronize', false),
        logging: this.getConfigBoolean('db.logging', false),
        ssl: this.getConfigBoolean('db.ssl', false),
      },
      cache: {
        ttl: this.getConfigNumber('cache.ttl', 60),
        schema: this.getConfigString('cache.schema', 'redis'),
        host: this.getConfigString('cache.host', '0.0.0.0'),
        port: this.getConfigNumber('cache.port', 6379),
        password: this.getConfigString('cache.password', 'admin'),
        reconnectTime: this.getConfigNumber('cache.reconnectTime', 50),
        tls: this.getConfigBoolean('cache.tls', false),
        keepAlive: this.getConfigNumber('cache.keepAlive', 1000),
      },
      api: {
        host: this.getConfigString('api.host', '0.0.0.0'),
        port: this.getConfigNumber('api.port', 8080),
        globalPrefix: this.getConfigString('api.globalPrefix', 'api'),
        auth: {
          jwt: {
            access: {
              publicKey: this.getConfigFromFile(
                'api.auth.jwt.access.publicKeyPath',
                'config/jwt-access-public.pem',
                this.getConfigString('api.auth.jwt.access.publicKey', publicKey)
              ),
              privateKey: this.getConfigFromFile(
                'api.auth.jwt.access.privateKeyPath',
                'config/jwt-access-private.pem',
                this.getConfigString(
                  'api.auth.jwt.access.publicKey',
                  privateKey
                )
              ),
              time: this.getConfigString('api.auth.jwt.access.time', '15m'),
            },
            confirmation: {
              secret: this.getConfigString(
                'api.auth.jwt.confirmation.secret',
                generateCode('cs_')
              ),
              time: this.getConfigString(
                'api.auth.jwt.confirmation.time',
                '1h'
              ),
            },
            resetPassword: {
              secret: this.getConfigString(
                'api.auth.jwt.resetPassword.secret',
                generateCode('rs_')
              ),
              time: this.getConfigString(
                'api.auth.jwt.resetPassword.time',
                '1h'
              ),
            },
            refresh: {
              secret: this.getConfigString(
                'api.auth.jwt.refresh.secret',
                generateCode('rs_')
              ),
              time: this.getConfigString('api.auth.jwt.refresh.time', '7d'),
            },
            utility: {
              secret: this.getConfigString(
                'api.auth.jwt.status.secret',
                generateCode('ss_')
              ),
              time: this.getConfigString('api.auth.jwt.status.time', '5m'),
            },
          },
          provider: {
            google: {
              clientId: this.getConfigString(
                'api.auth.provider.google.clientId'
              ),
              clientSecret: this.getConfigString(
                'api.auth.provider.google.clientSecret'
              ),
              authorizationURL: this.getConfigString(
                'api.auth.provider.google.authorizationURL',
                'https://accounts.google.com/o/oauth2/v2/auth'
              ),
              tokenURL: this.getConfigString(
                'api.auth.provider.google.tokenURL',
                'https://www.googleapis.com/oauth2/v4/token'
              ),
              userProfileURL: this.getConfigString(
                'api.auth.provider.google.userProfileURL',
                'https://www.googleapis.com/oauth2/v3/userinfo'
              ),
              callbackURL: this.getConfigString(
                'api.auth.provider.google.callbackURL',
                'http://localhost:8080/api/auth/google/callback'
              ),
              scope: this.getConfigObject<string[]>(
                'api.auth.provider.google.scope',
                ['email', 'profile']
              ),
            },
            clerk: {
              clientId: this.getConfigString(
                'api.auth.provider.clerk.clientId'
              ),
              clientSecret: this.getConfigString(
                'api.auth.provider.clerk.clientSecret'
              ),
              authorizationURL: this.getConfigString(
                'api.auth.provider.clerk.authorizationURL'
              ),
              tokenURL: this.getConfigString(
                'api.auth.provider.clerk.tokenURL'
              ),
              userProfileURL: this.getConfigString(
                'api.auth.provider.clerk.userProfileURL'
              ),
              callbackURL: this.getConfigString(
                'api.auth.provider.clerk.callbackURL',
                'http://localhost:8080/api/auth/clerk/callback'
              ),
              scope: this.getConfigObject<string[]>(
                'api.auth.provider.clerk.scope',
                ['profile', 'email']
              ),
            },
          },
        },
      },
      email: {
        host: this.getConfigString('email.host'),
        port: this.getConfigNumber('email.port', 587),
        auth: {
          user: this.getConfigString('email.auth.user'),
          pass: this.getConfigString('email.auth.pass'),
        },
        secure: this.getConfigBoolean('email.secure', false),
      },
    };
  }

  getEdgeAgentConfig(): IConfig['edgeAgent'] {
    return this.getConfig().edgeAgent;
  }

  getBrokerConfig(): IConfig['broker'] {
    return this.getConfig().broker;
  }

  getDbConfig(): IConfig['db'] {
    return this.getConfig().db;
  }

  getCacheConfig(): IConfig['cache'] {
    return this.getConfig().cache;
  }

  getApiConfig(): IConfig['api'] {
    return this.getConfig().api;
  }
}
