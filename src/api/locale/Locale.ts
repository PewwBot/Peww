import * as fs from 'fs';
import * as path from 'path';
import { PewwBot } from '../../PewwBot';
import { LocaleData } from './LocaleData';
import { LocaleMeta } from './LocaleMeta';

export class Locale {
  private bot: PewwBot;
  private name: string;
  private meta: LocaleMeta;
  private data: LocaleData;

  constructor(bot: PewwBot, name: string) {
    this.bot = bot;
    this.name = name;
  }

  public async load(): Promise<void> {
    try {
      const copyData = await JSON.parse(
        fs.readFileSync(path.join(this.bot.getMainFolder(), `locales/${this.name}.json`), 'utf-8')
      );
      this.meta = copyData.meta;
      if (this.meta) delete copyData.meta;
      else throw new Error('Meta is missing');
      this.data = copyData;
    } catch (error) {
      throw error;
    }
  }

  public getData(): LocaleData {
    return this.data;
  }
}
