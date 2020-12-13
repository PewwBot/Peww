import { PermissionString } from 'discord.js';
import { uuid } from 'uuidv4';
import { Command } from './Command';
import { CommandError } from './CommandError';
import { CommandPermission, CommandPermissions } from './CommandPermission';
import { CommandPredicate } from './CommandPredicate';
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
  requiredCustomPermission: CommandPermission = CommandPermissions.USER;
  predicates: CommandPredicate[] = [];

  constructor(
    args: {
      name?: string;
      description?: string;
      aliases?: string[];
      subs?: Function[];
      requiredPermissions?: PermissionString[];
      requiredCustomPermission?: CommandPermission;
      predicates?: CommandPredicate[];
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
    if (args.requiredCustomPermission) this.requiredCustomPermission = args.requiredCustomPermission;
    if (args.predicates) this.predicates = args.predicates;
  }

  init(): void {}

  call(context: CommandContext): void {
    if (this.predicates.length > 0) {
      for (const predicate of this.predicates) {
        try {
          predicate.apply(context);
        } catch (error) {
          if (error instanceof CommandError) {
            // TODO: add error message
            console.log(error);
            return;
          }
        }
      }
    }
    if (this.requiredCustomPermission) {
      try {
        this.requiredCustomPermission.test(context);
      } catch (error) {
        if (error instanceof CommandError) {
          // TODO: add error message
          console.log(error);
          return;
        }
      }
    }
    if (context.getArgs().length < 1) {
      this.run(context);
    } else {
      let finded = false;
      for (const sub of this.subs) {
        if (sub.aliases.includes(context.getArgs()[0])) {
          const newContext = context.clone(context.getArgs()[0], Object.assign([], context.getArgs()).splice(1));
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
