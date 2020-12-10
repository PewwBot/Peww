import { Command } from './Command';
import { CommandCategory } from './CommandCategory';
import { CommandContext } from './context/CommandContext';
import { CommandPermission } from './CommandPermission';
import { PewwBot } from '../../PewwBot';

export abstract class AbstractCommand implements Command {
  name: string;
  description: string;
  aliases: string[];
  permission?: CommandPermission;
  category: CommandCategory;

  public register(bot: PewwBot): void {
    bot.getCommandManager().register(this);
  }

  public unregister(bot: PewwBot): void {
    bot.getCommandManager().unregister(this);
  }

  abstract call(context: CommandContext): void;
}
