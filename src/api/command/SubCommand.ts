import { PermissionString } from 'discord.js';
import { Command } from './Command';
import { CommandContext } from './context/CommandContext';

export interface SubCommand {
  command: Command;
  uniqueId: string;
  name: string;
  description: string;
  aliases: string[];
  subs: SubCommand[];
  requiredPermissions: PermissionString[];

  init(): void;

  call(context: CommandContext): void;

  run(context: CommandContext): void;
}
