import { SubscriptionRegisterer } from './../api/subscription/SubscriptionRegisterer';
import { Subscriptions } from '../api/subscription/Subscriptions';

import * as Discord from 'discord.js';
import { Bot } from '../Bot';
import { Command } from '../api/command/Command';
import { ImmutableCommandContext } from '../api/command/context/ImmutableCommandContext';
import { Subscription } from '../api/subscription/Subscription';

export class CommandSubscription implements SubscriptionRegisterer<'message'> {
  get(): Subscription<'message'> {
    return Subscriptions.create('message')
      .name('Command')
      .filter((sub, message) => message.channel instanceof Discord.TextChannel)
      .handler((sub, message) => {
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
