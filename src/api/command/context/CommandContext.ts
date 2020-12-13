import * as Discord from 'discord.js';
import { PewwBot } from '../../../PewwBot';
import { EmbedBuilder } from '../../embed/EmbedBuilder';

export interface CommandContext {
  getBot(): PewwBot;

  getMessage(): Discord.Message;

  getLabel(): string;

  getPrefix(): string;

  getOrganizedPrefix(): string;

  reply(...messages: string[]): void;

  getArgs(): string[];

  getImmutableArgs(): string[];

  createEmbedBuilder(): EmbedBuilder;

  clone(newArgs?: string[]): CommandContext;
}
