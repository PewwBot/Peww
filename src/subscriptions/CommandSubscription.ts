import { SubscriptionRegisterer } from './../api/subscription/SubscriptionRegisterer';
import { Subscriptions } from '../api/subscription/Subscriptions';

import * as Discord from 'discord.js';
import { Bot } from '../Bot';
import { Command } from '../api/command/Command';
import { ImmutableCommandContext } from '../api/command/context/ImmutableCommandContext';
import { Subscription } from '../api/subscription/Subscription';
import { Guild } from '../api/cache/Guild';

export class CommandSubscription implements SubscriptionRegisterer<'message'> {
  get(): Subscription<'message'> {
    return Subscriptions.create('message')
      .name('Command')
      .filter((sub, message) => message.channel instanceof Discord.TextChannel)
      .filter((sub, message) => !message.author.bot)
      .handler(async (sub, message) => {
        let prefix = null;
        const allPrefix = Object.assign([], Bot.getInstance().getConfig().getData().prefix);
        allPrefix.push(`<@!${Bot.getInstance().getClient().user.id}> `);
        const guild = await Bot.getInstance().getCacheManager().getGuild(message.guild.id, true);
        if (guild && guild.getCustomPrefix().length > 0) allPrefix.push(...guild.getCustomPrefix());
        for (const thisPrefix of allPrefix) {
          if (message.content.startsWith(thisPrefix)) prefix = thisPrefix;
        }
        if (!prefix) return;
        const args: string[] = message.content.slice(prefix.length).trim().split(/ +/);
        const command: string = args.shift().toLowerCase();
        const commandObject: Command = Bot.getInstance().getCommandManager().getCommand(command);
        if (commandObject == null) return;
        commandObject.call(new ImmutableCommandContext(message, command, prefix, args));
      });
  }
}
