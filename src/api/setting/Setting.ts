import { SettingValueOrganizer } from './SettingValueOrganizer';
import { CommandContext } from '../command/context/CommandContext';
import { SettingMode } from './SettingMode';
import { SettingTypeOrganizer } from './SettingTypeOrganizer';
import { PewwBot } from '../../PewwBot';
import { SettingContext } from './context/SettingContext';
import { SettingChangeStatus } from './SettingChangeStatus';

export interface Setting<T, V> {
  bot: PewwBot;
  name: string;
  uniqueId: string;
  typeOrganizer: SettingTypeOrganizer<T>;
  valueOrganizer: SettingValueOrganizer<V>;
  modes: SettingMode[];

  init(): void;

  call(context: SettingContext<T, V>): Promise<SettingChangeStatus<V>>;

  run(context: SettingContext<T, V>): Promise<SettingChangeStatus<V>>;

  getModes(): SettingMode[];

  getAllModesAliases(): string[];

  help(context: CommandContext): void;

  getTypeOrganizer(): SettingTypeOrganizer<T>;

  getValueOrganizer(): SettingValueOrganizer<V>;

  // get(t: T): Promise<V | undefined>;
}
