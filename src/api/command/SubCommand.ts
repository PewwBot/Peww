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
  aliases: string[];
  subs: SubCommand[];
  requiredPermissions: PermissionString[];
  requiredCustomPermission: CommandPermission;
  predicates: CommandPredicate[];

  init(): void;

  call(context: CommandContext): void;

  run(context: CommandContext): void;
}
