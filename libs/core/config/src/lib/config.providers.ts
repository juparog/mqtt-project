import * as dotenv from 'dotenv';
import { existsSync, readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import lodash from 'lodash';
import { join } from 'path';

import { ENV_CONFIG_FILENAME, YAML_CONFIG_FILENAME } from './config.constants';
import { IConfigProvider } from './config.interfaces';

export class YamlProvider implements IConfigProvider {
  private internalConfig: Record<string, unknown> = {};

  constructor() {
    this.internalConfig = this.load();
  }

  get<T = unknown>(propertyPath: string): T {
    return lodash.get(this.internalConfig, propertyPath) as T;
  }

  private load() {
    try {
      if (existsSync(YAML_CONFIG_FILENAME)) {
        const config = yaml.load(
          readFileSync(join(YAML_CONFIG_FILENAME), 'utf8')
        );
        return config as Record<string, unknown>;
      }
    } catch (error) {
      console.error(`Error loading YAML config file: ${error}`);
    }

    return {};
  }
}

export class EnvProvider implements IConfigProvider {
  constructor() {
    dotenv.config({
      path: ENV_CONFIG_FILENAME,
    });
  }

  get<T = unknown>(propertyPath: string): T {
    const envKey = this.toEnvKey(propertyPath);
    return process.env[envKey] as T;
  }

  private toEnvKey(key: string): string {
    return `KS_${key.toUpperCase().replace(/\./g, '_')}`;
  }
}
