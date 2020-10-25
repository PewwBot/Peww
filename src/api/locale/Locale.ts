import { LocaleCode } from './LocaleCode';
import * as fs from 'fs';
import * as path from 'path';

import { LocaleData } from './LocaleData';
import { Bot } from '../../Bot';

export class Locale {
  private code: LocaleCode;
  private data: LocaleData;

  constructor(code: LocaleCode) {
    this.code = code;
  }

  public load(): boolean {
    try {
      this.data = JSON.parse(fs.readFileSync(path.join(Bot.getInstance().getMainFolder(), `locale/${this.code}.json`), 'utf-8'));
      return true;
    } catch (error) {
      throw error;
    }
  }

  public getCode(): LocaleCode {
    return this.code;
  }

  public getData(): LocaleData {
    return this.data;
  }
}
