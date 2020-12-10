import { PewwBot } from '../../PewwBot';
import { Locale } from './Locale';
import { LocaleCode } from './LocaleCode';

export class LocaleManager {
  private bot: PewwBot;
  private locales: Map<LocaleCode, Locale> = new Map();

  constructor(bot: PewwBot) {
    this.bot = bot;
  }

  public async load(): Promise<void> {
    for (const localeId of ['tr', 'en'] as LocaleCode[]) {
      const locale = new Locale(this.bot, localeId);
      try {
        locale.load();
        this.locales.set(localeId, locale);
        this.bot.getLogger().info(`${localeId.toUpperCase()} language has been loaded!`);
      } catch (error) {
        throw error;
      }
    }
  }

  public getLocale(code: LocaleCode): Locale | undefined {
    return this.locales.get(code);
  }

  public getLocales(): Map<LocaleCode, Locale> {
    return this.locales;
  }
}
