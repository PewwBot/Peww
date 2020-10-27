import { SettingBuilder } from './SettingBuilder';

export class Settings {
  public static create<T, V, M>(name: string): SettingBuilder<T, V, M> {
    return SettingBuilder.newBuilder<T, V, M>(name);
  }
}
