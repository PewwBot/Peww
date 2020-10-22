import * as fs from 'fs';
import * as path from 'path';

export type ConfigType = {
  token: string;
  prefix: string[];
  ownerId: string;
  pastebin: {
    apikey: string;
    username: string;
    password: string;
  };
};

export class Config {
  private data: ConfigType;
  private evalFiles: Map<string, string> = new Map();

  public load(callback: (error: Error) => void) {
    try {
      this.data = JSON.parse(fs.readFileSync(path.join(__dirname, 'config/config.json'), 'utf-8'));
      fs.readdirSync(path.join(__dirname, 'evaluates/')).filter((file) => file.endsWith('.epew')).forEach((file) =>
        this.evalFiles.set(file.replace('.epew', ''), fs.readFileSync(path.join(__dirname, 'evaluates/' + file), 'utf-8'))
      );
      callback(null);
    } catch (error) {
      callback(error);
    }
  }

  public getData(): ConfigType {
    return this.data;
  }

  public getEval(evalName: string): string | undefined {
    if (!this.evalFiles.has(evalName)) return null;
    return this.evalFiles.get(evalName);
  }
}
