import { Setting } from './Setting';
import { SettingBatchRegisterer } from './SettingBatchRegisterer';
import { SettingRegisterer } from './SettingRegisterer';
import * as fs from 'fs';
import * as path from 'path';
import { PewwBot } from '../../PewwBot';

export class SettingManager {
  private bot: PewwBot;
  private settings: Map<string, Setting<any, any>> = new Map();

  constructor(bot: PewwBot) {
    this.bot = bot;
  }

  public getCount(): number {
    return this.settings.size;
  }

  public get<T, V>(name: string): Setting<T, V> | undefined {
    if (!this.settings.has(name)) return null;
    return this.settings.get(name);
  }

  public getNameAllSettings(): string[] {
    return [...this.settings.keys()];
  }

  public register<T, V>(setting: Setting<T, V>): void {
    setting.bot = this.bot;
    if (!this.get(setting.name)) {
      try {
        setting.init();
        this.settings.set(setting.name, setting);
      } catch (error) {
        this.bot.getLogger().error(`${setting.name} setting could not be loaded!`);
      }
    }
  }

  public async registerPath(_path: string): Promise<void> {
    const files = await fs.readdirSync(_path);
    for (const file of files) {
      const filePath = path.join(_path, file);
      if ((await fs.statSync(filePath)).isDirectory()) {
        await this.registerPath(filePath);
      } else {
        const settingClazzRequire = await import(filePath);
        const settingClazz = settingClazzRequire.default ? settingClazzRequire.default : settingClazzRequire[Object.keys(settingClazzRequire)[0]];
        if (!settingClazz) continue;
        const clazzObject = new settingClazz();
        if (!clazzObject) continue;
        if (clazzObject instanceof SettingBatchRegisterer) {
          this.registerBatchClass(clazzObject);
        } else if (clazzObject instanceof SettingRegisterer) {
          this.registerClass(clazzObject);
        } else {
          this.register(clazzObject as Setting<any, any>);
          for (const clazzObject of Object.keys(settingClazzRequire).splice(1)) {
            const settingClazz = settingClazzRequire[clazzObject];
            if (!settingClazz) continue;
            this.register(new settingClazz() as Setting<any, any>);
          }
        }
      }
    }
  }

  public registerClass<T, V>(settingRegisterer: SettingRegisterer<T, V>): void {
    const setting = settingRegisterer.get();
    this.register(setting);
  }

  public registerBatchClass(settingBatchRegisterer: SettingBatchRegisterer): void {
    settingBatchRegisterer.get().forEach((setting) => {
      this.register(setting);
    });
  }

  public registerAll(...settings: Setting<any, any>[]): void {
    settings.forEach((setting) => this.register(setting));
  }

  public registerAllClass(...settingRegisterers: SettingRegisterer<any, any>[]): void {
    settingRegisterers.forEach((settingRegisterer) => {
      this.registerClass(settingRegisterer);
    });
  }

  public registerAllBatchClass(...settingBatchRegisterers: SettingBatchRegisterer[]): void {
    settingBatchRegisterers.forEach((settingBatchRegisterer) => {
      this.registerBatchClass(settingBatchRegisterer);
    });
  }

  public unregister(setting: Setting<any, any>): void {
    if (!this.settings.has(setting.name)) return;
    this.settings.delete(setting.name);
  }

  public unregisterWithName(settingName: string): void {
    if (!this.settings.has(settingName)) return;
    this.settings.delete(settingName);
  }

}
