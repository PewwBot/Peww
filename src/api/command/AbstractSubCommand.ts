import { PermissionString } from 'discord.js';
import { v4 as uuidv4 } from 'uuid';
import { Command } from './Command';
import { CommandError } from './CommandError';
import { CommandPermission, CommandPermissions } from './CommandPermission';
import { CommandPredicate } from './CommandPredicate';
import { CommandContext } from './context/CommandContext';
import { SubCommand } from './SubCommand';

export abstract class AbstractSubCommand implements SubCommand {
  command: Command;
  uniqueId: string = uuidv4();
  name: string;
  description: string = '';
  usage: string = '';
  examples: string[] = [];
  aliases: string[] = [];
  subs: SubCommand[] = [];
  requiredBotPermissions: PermissionString[] = [];
  requiredPermission: CommandPermission = CommandPermissions.USER;
  predicates: CommandPredicate[] = [];

  constructor(args: { name: string }) {
    this.name = args.name;
  }

  public setupOptions(
    args: {
      aliases?: string[];
      description?: string;
      usage?: string;
      examples?: string[];
      subs?: Function[];
      requiredBotPermissions?: PermissionString[];
      requiredPermission?: CommandPermission;
      predicates?: CommandPredicate[];
    } = {}
  ) {
    if (args.aliases) this.aliases = args.aliases;
    if (args.description) this.description = args.description;
    if (args.usage) this.usage = args.usage;
    if (args.examples) this.examples = args.examples;
    if (args.subs) {
      for (const subFunction of args.subs) {
        const sub: SubCommand = new (subFunction as any)();
        this.subs.push(sub);
      }
    }
    if (args.requiredBotPermissions) this.requiredBotPermissions = args.requiredBotPermissions;
    if (args.requiredPermission) this.requiredPermission = args.requiredPermission;
    if (args.predicates) this.predicates = args.predicates;
  }

  abstract init(): void;

  async call(context: CommandContext): Promise<void> {
    if (this.predicates.length > 0) {
      for (const predicate of this.predicates) {
        try {
          predicate.apply(context);
        } catch (error) {
          if (error instanceof CommandError) {
            this.command.methods.sendErrorMessage(context, 'Command Failure', error.message);
            console.log(error);
            return;
          }
        }
      }
    }
    if (this.requiredBotPermissions.length > 0) {
      for (const permission of this.requiredBotPermissions) {
        if (!context.getMessage().guild.me.hasPermission(permission)) return;
      }
    }
    if (this.requiredPermission) {
      try {
        this.requiredPermission.test(context);
      } catch (error) {
        if (error instanceof CommandError) {
          this.command.methods.sendErrorMessage(context, 'Command Failure', error.message);
          console.log(error);
          return;
        }
      }
    }
    try {
      await this.test(context);
    } catch (error) {
      if (error instanceof CommandError) {
        this.command.methods.sendErrorMessage(context, 'Command Failure', error.message);
        console.log(error);
        return;
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

  async test(context: CommandContext, args?: any): Promise<void> {
    return;
  }

  abstract run(context: CommandContext): void;
}
