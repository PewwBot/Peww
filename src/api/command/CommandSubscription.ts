import { SubscriptionRegisterer } from '../subscription/SubscriptionRegisterer';
import { Subscriptions } from '../subscription/Subscriptions';

import * as Discord from 'discord.js';
import { PewwBot } from '../../PewwBot';
import { Command } from './Command';
import { ImmutableCommandContext } from './context/ImmutableCommandContext';
import { Subscription } from '../subscription/Subscription';

export class CommandSubscription implements SubscriptionRegisterer<'message'> {
  private bot: PewwBot;

  constructor(bot: PewwBot) {
    this.bot = bot;
  }

  get(): Subscription<'message'> {
    return Subscriptions.create('message')
      .name('Command')
      .filter((sub, message) => message.channel instanceof Discord.TextChannel)
      .filter((sub, message) => !message.author.bot)
      .handler(async (sub, message) => {
        let prefix = null;
        const guild = await this.bot.getCacheManager().getGuild(message.guild.id, true);
        const allPrefix =
          guild && !guild.defaultPrefix && guild.getCustomPrefix().length > 0
            ? []
            : Object.assign([], this.bot.getConfig().getData().prefix);
        /*if ((guild && !guild.defaultPrefix && guild.getCustomPrefix().length > 0) || !guild)*/
        allPrefix.push(`<@!${this.bot.user.id}> `);
        if (guild && guild.getCustomPrefix().length > 0) allPrefix.push(...guild.getCustomPrefix());
        for (const thisPrefix of allPrefix) {
          if (message.content.startsWith(thisPrefix)) prefix = thisPrefix;
        }
        if (!prefix) return;
        const args: string[] = message.content.slice(prefix.length).trim().split(/ +/);
        const command: string = args.shift().toLowerCase();
        const commandObject: Command = this.bot.getCommandManager().getCommand(command);
        if (commandObject == null) return;
        commandObject.call(new ImmutableCommandContext(this.bot, message, command, prefix, args));
      });
  }
}
