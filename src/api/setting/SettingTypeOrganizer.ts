import { CommandContext } from '../command/context/CommandContext';

export interface SettingTypeOrganizer<T> {
  organize(context: CommandContext): T;
}
