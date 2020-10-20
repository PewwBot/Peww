import * as Discord from 'discord.js';
import { Bot } from '../../../Bot';
import { CommandContext } from './CommandContext';

export class ImmutableCommandContext implements CommandContext {
  private readonly message: Discord.Message;
  private readonly label: string;
  private readonly prefix: string;
  private readonly args: string[];

  constructor(message: Discord.Message, label: string, prefix: string, args: string[]) {
    this.message = message;
    this.label = label;
    this.prefix = prefix;
    this.args = args;
  }

  getBot(): Bot {
    return Bot.getInstance();
  }

  getLabel(): string {
    return this.label;
  }

  getPrefix(): string {
    return this.prefix;
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
}
