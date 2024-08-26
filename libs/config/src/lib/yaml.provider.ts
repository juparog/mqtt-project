import { existsSync, readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import { join } from 'path';

const YAML_CONFIG_FILENAME = 'config/config.yaml';

export default (): Record<string, unknown> => {
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
};
