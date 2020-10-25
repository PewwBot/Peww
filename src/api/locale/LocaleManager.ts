import { Bot } from '../../Bot';
import { Locale } from './Locale';
import { LocaleCode } from './LocaleCode';

export class LocaleManager {
  private locales: Map<LocaleCode, Locale> = new Map();

  public load(callback: (error: Error) => void) {
    for (const localeId of ['tr', 'en'] as LocaleCode[]) {
      const locale = new Locale(localeId);
      try {
        locale.load();
        this.locales.set(localeId, locale);
        Bot.getInstance().getLogger().info(`${localeId.toUpperCase()} language has been loaded!`);
      } catch (error) {
        callback(error);
        return;
      }
    }
    callback(null);
  }

  public getLocale(code: LocaleCode): Locale | undefined {
    return this.locales.get(code);
  }

  public getLocales(): Map<LocaleCode, Locale> {
    return this.locales;
  }

}
