import { Command } from './Command';
import { CommandCategory } from './CommandCategory';
import { Bot } from '../../Bot';
import { CommandContext } from './context/CommandContext';

export abstract class AbstractCommand implements Command {
  name: string;
  description: string;
  aliases: string[];
  category: CommandCategory;

  public register(): void {
    Bot.getInstance().getCommandManager().register(this);
  }

  public unregister(): void {
    Bot.getInstance().getCommandManager().unregister(this);
  }

  abstract call(context: CommandContext): void;

}
