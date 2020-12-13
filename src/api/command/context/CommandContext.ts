import * as Discord from 'discord.js';
import { PewwBot } from '../../../PewwBot';
import { EmbedBuilder } from '../../embed/EmbedBuilder';
import { Command } from '../Command';

export interface CommandContext {
  getBot(): PewwBot;

  getMessage(): Discord.Message;

  getCommand(): Command;

  getLabel(): string;

  getPrefix(): string;

  getOrganizedPrefix(): string;

  reply(...messages: string[]): void;

  getArgs(): string[];

  getImmutableArgs(): string[];

  createEmbedBuilder(): EmbedBuilder;

  clone(newLabel?: string, newArgs?: string[]): CommandContext;
}
