import { MessageEmbed, PermissionString } from 'discord.js';
import { PewwBot } from '../../PewwBot';
import { CommandCategory } from './CommandCategory';
import { CommandContext } from './context/CommandContext';
import { SubCommand } from './SubCommand';

export interface Command {
  bot: PewwBot;
  uniqueId: string;
  mode: 'normal' | 'subs' | 'subswithfunc';
  name: string;
  cooldown: {
    time: number;
    message: string | MessageEmbed;
  };
  subs: SubCommand[];
  runIn: ['text', 'dm'];
  category: CommandCategory;
  description: string;
  usage: string;
  aliases: string[];
  requiredPermissions: PermissionString[];

  /**
   * works when the command is registered.
   */
  init(): void;

  /**
   * used to register the command.
   */
  register(): void;

  /**
   * used to unregister the command.
   */
  unregister(): void;

  /**
   * works when the command is used.
   * @param context Data collected during command execution.
   */
  call(context: CommandContext): void;

  run(context: CommandContext): void;
}
