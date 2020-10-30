import { SettingValueOrganizer } from './SettingValueOrganizer';
import { CommandContext } from '../command/context/CommandContext';
import { SettingChangeStatus } from './SettingChangeStatus';
import { SettingMode } from './SettingMode';

export interface Setting<T, V> {
  name: string;

  typeOrganizer: (context: CommandContext) => any;

  valueOrganizer: SettingValueOrganizer<any>;

  getModes(): SettingMode[];

  getAllModesAliases(): string[];

  help(context: CommandContext): void;

  // get(t: T): Promise<V | undefined>;

  handle(t: T, v: V, mode?: SettingMode, currentModeArgs?: string[]): Promise<SettingChangeStatus<V>>;
}
