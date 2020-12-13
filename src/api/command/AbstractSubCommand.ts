import { PermissionString } from 'discord.js';
import { uuid } from 'uuidv4';
import { Command } from './Command';
import { CommandContext } from './context/CommandContext';
import { SubCommand } from './SubCommand';

export abstract class AbstractSubCommand implements SubCommand {
  command: Command;
  uniqueId: string = uuid();
  name: string;
  description: string = '';
  aliases: string[] = [];
  subs: SubCommand[] = [];
  requiredPermissions: PermissionString[] = [];

  constructor(
    args: {
      name?: string;
      description?: string;
      aliases?: string[];
      subs?: Function[];
      requiredPermissions?: PermissionString[];
    } = {}
  ) {
    if (args.name) this.name = args.name;
    if (args.description) this.description = args.description;
    if (args.aliases) this.aliases = args.aliases;
    if (args.subs) {
      for (const subFunction of args.subs) {
        const sub: SubCommand = new (subFunction as any)();
        this.subs.push(sub);
      }
    }
    if (args.requiredPermissions) this.requiredPermissions = args.requiredPermissions;
  }

  init(): void {}

  call(context: CommandContext): void {
    if (context.getArgs().length < 1) {
      this.run(context);
    } else {
      let finded = false;
      for (const sub of this.subs) {
        if (sub.aliases.includes(context.getArgs()[0])) {
          const newContext = context.clone(Object.assign([], context.getArgs()).splice(1));
          sub.call(newContext);
          finded = true;
          break;
        }
      }
      if (!finded) this.run(context);
    }
  }

  abstract run(context: CommandContext): void;
}
