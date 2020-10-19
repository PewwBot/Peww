import * as Discord from 'discord.js';
import { Bot } from '../../../Bot';

export interface CommandContext {
  getBot(): Bot;

  getLabel(): string;

  getMessage(): Discord.Message;

  reply(...messages: string[]): void;

  getArgs(): string[];
}