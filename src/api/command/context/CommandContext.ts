import * as Discord from 'discord.js';
import { PewwBot } from '../../../PewwBot';
import { EmbedBuilder } from '../../embed/EmbedBuilder';

export interface CommandContext {
  getBot(): PewwBot;

  getLabel(): string;

  getPrefix(): string;

  getOrganizedPrefix(): string;

  getMessage(): Discord.Message;

  reply(...messages: string[]): void;

  getArgs(): string[];

  getImmutableArgs(): string[];

  createEmbedBuilder(): EmbedBuilder;
}