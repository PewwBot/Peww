import * as fs from 'fs';
import * as path from 'path';

export type ConfigType = {
  token: string;
  prefix: string[];
  ownerId: string;
};

export class Config {
  private data: ConfigType;

  public load(callback: (error: Error) => void) {
    try {
      this.data = JSON.parse(fs.readFileSync(path.join(__dirname, 'config/config.json'), 'utf-8'));
      callback(null);
    } catch (error) {
      callback(error);
    }
  }

  public getData(): ConfigType {
    return this.data;
  }
}
