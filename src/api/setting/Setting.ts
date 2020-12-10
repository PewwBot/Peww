import { SettingValueOrganizer } from './SettingValueOrganizer';
import { CommandContext } from '../command/context/CommandContext';
import { SettingChangeStatus } from './SettingChangeStatus';
import { SettingMode } from './SettingMode';
import { SettingContext } from './context/SettingContext';

export interface Setting<T, V> {
  name: string;

  typeOrganizer: (context: CommandContext) => T;

  valueOrganizer: SettingValueOrganizer<any>;

  getModes(): SettingMode[];

  getAllModesAliases(): string[];

  help(context: CommandContext): void;

  // get(t: T): Promise<V | undefined>;

  handle(context: SettingContext<T, V>): Promise<SettingChangeStatus<V>>;
}
