import { Setting } from './Setting';
import { SettingBatchRegisterer } from './SettingBatchRegisterer';
import { SettingRegisterer } from './SettingRegisterer';

export class SettingManager {
  private data: Map<string, Setting<any, any, any>> = new Map();

  constructor() {}

  public get<T, V, M>(name: string): Setting<T, V, M> {
    return this.data.get(name);
  }

  public register<T, V, M>(setting: Setting<T, V, M>): void {
    if (!this.get(setting.name)) {
      this.data.set(setting.name, setting);
    }
  }

  public registerClass<T, V, M>(settingRegisterer: SettingRegisterer<T, V, M>): void {
    const setting = settingRegisterer.get();
    if (!this.get(setting.name)) {
      this.data.set(setting.name, setting);
    }
  }

  public registerBatchClass(settingBatchRegisterer: SettingBatchRegisterer): void {
    settingBatchRegisterer.get().forEach((setting) => {
      this.register(setting);
    });
  }

  public registerAll(...settings: Setting<any, any, any>[]): void {
    settings.forEach((setting) => this.register(setting));
  }

  public registerAllClass(...settingRegisterers: SettingRegisterer<any, any, any>[]): void {
    settingRegisterers.forEach((settingRegisterer) => {
      this.registerClass(settingRegisterer);
    });
  }

  public unregister(setting: Setting<any, any, any>): void {
    if (!this.data.has(setting.name)) return;
    this.data.delete(setting.name);
  }

  public unregisterWithName(settingName: string): void {
    if (!this.data.has(settingName)) return;
    this.data.delete(settingName);
  }

}
