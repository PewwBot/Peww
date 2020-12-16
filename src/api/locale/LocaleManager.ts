import * as fs from 'fs';
import * as path from 'path';
import { PewwBot } from '../../PewwBot';
import { Locale } from './Locale';

export class LocaleManager {
  private bot: PewwBot;
  private locales: Map<string, Locale> = new Map();

  constructor(bot: PewwBot) {
    this.bot = bot;
  }

  public async loadPath(_path: string): Promise<void> {
    const files = await fs.readdirSync(_path);
    for (const fileName of files) {
      const filePath = path.join(_path, fileName);
      if ((await fs.statSync(filePath)).isDirectory()) {
        await this.loadPath(filePath);
      } else {
        const editedFileName = fileName.replace(new RegExp(/.json$/), '');
        const locale = new Locale(this.bot, editedFileName);
        try {
          await locale.load();
          this.locales.set(editedFileName, locale);
          this.bot.getLogger().info(`${editedFileName.toUpperCase()} language has been loaded!`);
        } catch (error) {
          this.bot
            .getLogger()
            .info(
              `${editedFileName.toUpperCase()} language could not be loaded!${
                (error as Error).message ? ' ' + error.message : ''
              }`
            );
          throw error;
        }
      }
    }
  }

  // tslint:disable-next-line: no-unnecessary-initializer
  private getMessageFromData(localeCode: string, _key: string, mainKey: any = null, ...variables: string[]): string | undefined {
    const locale = this.getLocale(localeCode);
    if (!locale) return 'The specified language does not exist.';
    const splittedKey = _key.split('.');
    if (mainKey ? mainKey[splittedKey[0]] === undefined : locale.getData()[splittedKey[0]] === undefined) {
      return 'the language address is incorrect!';
    } else if (
      mainKey ? typeof mainKey[splittedKey[0]] === 'object' : typeof locale.getData()[splittedKey[0]] === 'object'
    ) {
      return mainKey
        ? this.getMessageFromData(
            localeCode,
            splittedKey.splice(1).join('.'),
            mainKey[splittedKey[0]],
            ...(variables.length > 0 ? variables : [])
          )
        : this.getMessageFromData(
            localeCode,
            splittedKey.splice(1).join('.'),
            locale.getData()[splittedKey[0]],
            ...(variables.length > 0 ? variables : [])
          );
    } else if (
      mainKey ? typeof mainKey[splittedKey[0]] === 'string' : typeof locale.getData()[splittedKey[0]] === 'string'
    ) {
      if (splittedKey.length > 1) return 'the language address is incorrect!';
      let value = mainKey ? (mainKey[splittedKey[0]] as string) : (locale.getData()[splittedKey[0]] as string);
      if (variables.length > 1) {
        for (let i = 0; i < variables.length; i += 2) {
          if (
            variables[i] === null ||
            variables[i] === undefined ||
            variables[i + 1] === null ||
            variables[i + 1] === undefined
          )
            continue;
          value = value.replace(variables[i], variables[i + 1]);
        }
      }
      return value;
    } else {
      return 'the language address is incorrect!';
    }
  }

  // tslint:disable-next-line: no-unnecessary-initializer
  public getMessage(localeCode: string, _key: string, ...variables: string[]): string | undefined {
    return this.getMessageFromData(localeCode, _key, null, ...(variables.length > 0 ? variables : []));
  }

  public getLocale(localeCode: string): Locale | undefined {
    return this.locales.get(localeCode);
  }

  public getLocales(): Map<string, Locale> {
    return this.locales;
  }
}
