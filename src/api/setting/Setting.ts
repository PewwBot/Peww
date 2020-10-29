import { SettingValueOrganizer } from './SettingValueOrganizer';
import { CommandContext } from '../command/context/CommandContext';
import { SettingChangeStatus } from './SettingChangeStatus';

export interface Setting<T, V, M> {
  name: string;

  getValueOrganizer(): SettingValueOrganizer<any>;

  getModes(): M[];

  help(context: CommandContext): void;

  get(t: T): Promise<V | undefined>;

  change(t: T, v: V, mode?: M): Promise<SettingChangeStatus<V>>;
}
