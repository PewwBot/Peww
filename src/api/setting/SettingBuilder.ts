import { SettingChangeStatus } from './SettingChangeStatus';
import { Setting } from './Setting';
import { CommandContext } from '../command/context/CommandContext';

export class SettingBuilder<T, V, M> {
  private data: {
    name?: string;
    help?: (context: CommandContext) => void;
    get?: (t: T) => Promise<V>;
  } = {};

  constructor(name: string) {
    this.data.name = name;
  }

  public static newBuilder<T, V, M>(name: string): SettingBuilder<T, V, M> {
    return new SettingBuilder(name);
  }

  public name(name: string): SettingBuilder<T, V, M> {
    this.data.name = name;
    return this;
  }

  public help(handler: (context: CommandContext) => void): SettingBuilder<T, V, M> {
    this.data.help = handler;
    return this;
  }

  public getHandler(handler: (t: T) => Promise<V | undefined>): SettingBuilder<T, V, M> {
    this.data.get = handler;
    return this;
  }

  public changeHandler(handler: (t: T, v: V, mode?: M) => Promise<SettingChangeStatus<V>>): Setting<T, V, M> {
    return {
      name: this.data.name,
      help: this.data.help,
      get: this.data.get,
      change: handler,
    };
  }
}
