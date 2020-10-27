import { Setting } from './Setting';

export class SettingBuilder<T, V> {
  private data: {
    name?: string;
  } = {};

  constructor(name: string) {
    this.data.name = name;
  }

  public static newBuilder<T, V>(name: string): SettingBuilder<T, V> {
    return new SettingBuilder(name);
  }

  public name(name: string): SettingBuilder<T, V> {
    this.data.name = name;
    return this;
  }

  public handler(handler: (t: T, v: V) => void): Setting<T, V> {
    return {
      name: this.data.name,
      accept: handler
    };
  }
}
