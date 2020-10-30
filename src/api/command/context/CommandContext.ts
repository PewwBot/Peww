import * as Discord from 'discord.js';
import { Bot } from '../../../Bot';
import { EmbedBuilder } from '../../embed/EmbedBuilder';

export interface CommandContext {
  getBot(): Bot;

  getLabel(): string;

  getPrefix(): string;

  getOrganizedPrefix(): string;

  getMessage(): Discord.Message;

  reply(...messages: string[]): void;

  getArgs(): string[];

  getImmutableArgs(): string[];

  createEmbedBuilder(): EmbedBuilder;
}