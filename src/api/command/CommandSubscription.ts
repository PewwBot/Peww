import * as Discord from 'discord.js';
import { PewwGuild } from '../../structures/GuildStructure';
import { AbstractSubscription } from '../subscription/AbstractSubscription';
import { SubscriptionContext } from '../subscription/context/SubscriptionContext';
import { Command } from './Command';
import { ImmutableCommandContext } from './context/ImmutableCommandContext';

export class CommandSubscription extends AbstractSubscription<'message'> {
  constructor() {
    super({
      name: 'Command',
    });
  }

  init(): void {
    this.setupOptions({
      event: 'message',
    });
  }

  async run(context: SubscriptionContext<'message'>): Promise<void> {
    if (!(context.getParams()[0].channel instanceof Discord.TextChannel)) return;
    if (context.getParams()[0].author.bot) return;
    let prefix = null;
    const guild: PewwGuild = (await this.bot.guilds.cache.get(context.getParams()[0].guild.id)) as PewwGuild;
    if (!guild) return;
    await guild.load();
    const allPrefix =
      guild && !guild.getCustomData().command.defaultPrefix && guild.getCustomData().command.customPrefix.length > 0
        ? []
        : Object.assign([], this.bot.getConfig().getData().prefix);
    /*if ((guild && !guild.defaultPrefix && guild.getCustomPrefix().length > 0) || !guild)*/
    allPrefix.push(`<@!${this.bot.user.id}> `);
    if (guild && guild.getCustomData().command.customPrefix.length > 0)
      allPrefix.push(...guild.getCustomData().command.customPrefix);
    for (const thisPrefix of allPrefix) {
      if (context.getParams()[0].content.startsWith(thisPrefix)) prefix = thisPrefix;
    }
    if (!prefix) return;
    const args: string[] = context.getParams()[0].content.slice(prefix.length).trim().split(/ +/);
    const command: string = args.shift().toLowerCase();
    const commandObject: Command = this.bot.getCommandManager().getCommand(command);
    if (commandObject == null) return;
    commandObject.call(
      new ImmutableCommandContext(this.bot, context.getParams()[0], commandObject, command, prefix, args)
    );
  }
}
