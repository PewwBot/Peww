import { SettingBuilder } from './SettingBuilder';

export class Settings {
  public static create<T, V>(name: string): SettingBuilder<T, V> {
    return SettingBuilder.newBuilder<T, V>(name);
  }
}
