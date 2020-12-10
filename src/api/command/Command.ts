import { PewwBot } from '../../PewwBot';
import { CommandCategory } from './CommandCategory';
import { CommandPermission } from './CommandPermission';
import { CommandContext } from './context/CommandContext';

export interface Command {
  name: string;
  description: string;
  aliases: string[];
  permission?: CommandPermission;
  category: CommandCategory;

  register(bot: PewwBot): void;

  unregister(bot: PewwBot): void;

  call(context: CommandContext): void;
}
