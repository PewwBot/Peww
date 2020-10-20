import * as Discord from 'discord.js';
import { Bot } from '../../Bot';
import { Command } from './Command';
import { ImmutableCommandContext } from './context/ImmutableCommandContext';

export class CommandEvent {
  public static load() {
    Bot.getInstance()
      .getClient()
      .on('message', (message: Discord.Message) => {
        if (!(message.channel instanceof Discord.TextChannel)) return;
        let prefix = null;
        for (const thisPrefix of Bot.getInstance().getConfig().getData().prefix) {
          if (message.content.startsWith(thisPrefix)) prefix = thisPrefix;
        }
        if (!prefix) return;
        if (message.author.bot) return;
        const args: string[] = message.content.slice(prefix.length).trim().split(/ +/);
        const command: string = args.shift().toLowerCase();
        const commandObject: Command = Bot.getInstance().getCommandManager().getCommand(command);
        if (commandObject == null) return;
        commandObject.call(new ImmutableCommandContext(message, command, prefix, args));
      });
  }
}
