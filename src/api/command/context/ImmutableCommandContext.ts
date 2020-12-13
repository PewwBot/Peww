import * as Discord from 'discord.js';
import { PewwBot } from '../../../PewwBot';
import { EmbedBuilder } from '../../embed/EmbedBuilder';
import { Command } from '../Command';
import { CommandContext } from './CommandContext';

export class ImmutableCommandContext implements CommandContext {
  private readonly bot: PewwBot;
  private readonly message: Discord.Message;
  private readonly command: Command;
  private readonly label: string;
  private readonly prefix: string;
  private readonly args: string[];

  constructor(bot: PewwBot, message: Discord.Message, command: Command, label: string, prefix: string, args: string[]) {
    this.bot = bot;
    this.message = message;
    this.command = command;
    this.label = label;
    this.prefix = prefix;
    this.args = args;
  }

  getBot(): PewwBot {
    return this.bot;
  }

  getLabel(): string {
    return this.label;
  }

  getCommand(): Command {
    return this.command;
  }

  getPrefix(): string {
    return this.prefix;
  }

  getOrganizedPrefix(): string {
    return this.prefix.startsWith('<@!') ? this.getBot().getConfig().getData().prefix[0] : this.prefix;
  }

  getMessage(): Discord.Message {
    return this.message;
  }

  reply(...messages: string[]): void {
    this.message.channel.send(messages.join('\n'));
  }

  getArgs(): string[] {
    return this.args;
  }

  getImmutableArgs(): string[] {
    return Object.assign([], this.args);
  }

  createEmbedBuilder(data?: Discord.MessageEmbed | Discord.MessageEmbedOptions): EmbedBuilder {
    return new EmbedBuilder(data);
  }

  clone(newLabel?: string, newArgs?: string[]): CommandContext {
    const newContext = new ImmutableCommandContext(
      this.bot,
      this.message,
      this.command,
      newLabel ? newLabel : this.label,
      this.prefix,
      newArgs ? newArgs : this.args
    );
    return newContext;
  }
}
