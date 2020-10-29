import { SettingValueOrganizer } from './SettingValueOrganizer';
import { CommandContext } from '../command/context/CommandContext';
import { SettingChangeStatus } from './SettingChangeStatus';

export interface Setting<T, V> {
  name: string;

  typeOrganizer: (context: CommandContext) => any;

  valueOrganizer: SettingValueOrganizer<any>;

  getModes(): string[];

  help(context: CommandContext): void;

  get(t: T): Promise<V | undefined>;

  change(t: T, v: V, mode?: string): Promise<SettingChangeStatus<V>>;
}
