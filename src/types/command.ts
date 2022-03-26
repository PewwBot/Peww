import { Message, MessageEmbed, PermissionString } from 'discord.js';
import { PewwClient } from '../client';
import { Command } from '../lib/command/command';
import { CommandCategory } from '../lib/command/commandCategory';
import { CommandMethods } from '../lib/command/commandMethods';
import { CommandPredicate } from '../lib/command/commandPredicate';

export interface CommandOptions {
  name: string;
  description?: string;
  usage?: string;
  examples?: string[];
  category: CommandCategory;
  aliases: string[];
  runIn: ['text', 'dm'];
  cooldown?: {
    time: number;
    message: string | MessageEmbed;
  };
  requiredBotPermissions: PermissionString[];
  requiredPermission: CommandPermission;
  predicates: CommandPredicate[];
  methods: CommandMethods;
}

export interface CommandContext {

  get client(): PewwClient;

  get message(): Message;

  get command(): Command;

  get label(): string;

  get prefix(): string;

  get organizedPrefix(): string;

  reply(...messages: string[]): void;

  get args(): string[];

  get immutableArgs(): string[];

  copy(newLabel?: string, newArgs?: string[]): CommandContext;

}

export interface CommandPermission {
  test(context: CommandContext): Promise<void>;
}