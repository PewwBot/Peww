import { LocaleCode } from './LocaleCode';
import * as fs from 'fs';
import * as path from 'path';

import { LocaleData } from './LocaleData';
import { PewwBot } from '../../PewwBot';

export class Locale {
  private bot: PewwBot;
  private code: LocaleCode;
  private data: LocaleData;

  constructor(bot: PewwBot, code: LocaleCode) {
    this.bot = bot;
    this.code = code;
  }

  public load(): boolean {
    try {
      this.data = JSON.parse(fs.readFileSync(path.join(this.bot.getMainFolder(), `locale/${this.code}.json`), 'utf-8'));
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
