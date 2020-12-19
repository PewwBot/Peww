import { PermissionString } from 'discord.js';
import { Command } from './Command';
import { CommandPermission } from './CommandPermission';
import { CommandPredicate } from './CommandPredicate';
import { CommandContext } from './context/CommandContext';

export interface SubCommand {
  command: Command;
  uniqueId: string;
  name: string;
  description: string;
  usage: string;
  aliases: string[];
  subs: SubCommand[];
  requiredBotPermissions: PermissionString[];
  requiredPermission: CommandPermission;
  predicates: CommandPredicate[];

  init(): void;

  call(context: CommandContext): void;

  test(context: CommandContext): Promise<void>;

  run(context: CommandContext): void;
}
