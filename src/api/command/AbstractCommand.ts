import { Command } from './Command';
import { CommandCategory } from './CommandCategory';
import { CommandContext } from './context/CommandContext';
import { PewwBot } from '../../PewwBot';

import { v4 as uuidv4 } from 'uuid';
import { MessageEmbed, PermissionString } from 'discord.js';
import { SubCommand } from './SubCommand';
import { CommandPredicate } from './CommandPredicate';
import { CommandError } from './CommandError';
import { CommandPermission, CommandPermissions } from './CommandPermission';
import { CommandUsage } from './CommandUsage';
import { Argument } from './argument/Argument';

export abstract class AbstractCommand implements Command {
  bot: PewwBot;
  uniqueId: string = uuidv4();
  name: string;
  mode: 'normal' | 'argument' | 'subs' | 'subswithfunc' = 'normal';
  cooldown: { time: number; message: string | MessageEmbed } = undefined;
  subs: SubCommand[] = [];
  runIn: ['text', 'dm'] = ['text', 'dm'];
  category: CommandCategory = CommandCategory.OTHER;
  description: string = '';
  usage: CommandUsage = undefined;
  aliases: string[] = [];
  requiredPermissions: PermissionString[] = [];
  requiredCustomPermission: CommandPermission = CommandPermissions.USER;
  predicates: CommandPredicate[] = [];

  [func: string]: any;

  constructor(args: { name: string }) {
    this.name = args.name;
  }

  public setupOptions(
    args: {
      mode?: 'normal' | 'argument' | 'subs' | 'subswithfunc';
      cooldown?: { time: number; message: string | MessageEmbed };
      subs?: Function[];
      runIn?: ['text', 'dm'];
      category?: CommandCategory;
      description?: string;
      usage?: Function;
      aliases?: string[];
      requiredPermissions?: PermissionString[];
      requiredCustomPermission?: CommandPermission;
      predicates?: CommandPredicate[];
    } = {}
  ): void {
    if (args.mode) this.mode = args.mode;
    if (args.cooldown) this.cooldown = args.cooldown;
    if (args.subs) {
      for (const subFunction of args.subs) {
        const sub: SubCommand = new (subFunction as any)();
        sub.command = this;
        try {
          sub.init();
          this.setupAllSubs(sub);
          this.subs.push(sub);
        } catch (error) {
          this.bot.getLogger().error(`(${this.name}) ${sub.name} sub-command could not be loaded!`);
        }
      }
    }
    if (args.runIn) this.runIn = args.runIn;
    if (args.category) this.category = args.category;
    if (args.description) this.description = args.description;
    if (args.aliases) this.aliases = args.aliases;
    if (args.requiredPermissions) this.requiredPermissions = args.requiredPermissions;
    if (args.requiredCustomPermission) this.requiredCustomPermission = args.requiredCustomPermission;
    if (args.predicates) this.predicates = args.predicates;
    if (args.usage) {
      const usageObject: CommandUsage = new (args.usage as any)();
      usageObject.command = this;
      usageObject.init();
      // tslint:disable-next-line: forin
      for (const usageArgumentNum in usageObject.arguments) {
        const usageArgument = usageObject.arguments[usageArgumentNum];
        if (usageArgument.multiple && Number(usageArgumentNum) < (usageObject.arguments.length - 1)) {
          throw new CommandError('Only the last argument can be multiple.');
        }
      }
      this.usage = usageObject;
    }
  }

  private setupAllSubs(_sub: SubCommand): void {
    for (const sub of _sub.subs) {
      sub.command = this;
      try {
        sub.init();
        if (sub.subs.length > 0) this.setupAllSubs(sub);
      } catch (error) {
        this.bot.getLogger().error(`(${this.name}) ${sub.name} sub-command could not be loaded!`);
      }
    }
  }

  abstract init(): void;

  public register(): void {
    this.bot.getCommandManager().register(this);
  }

  public unregister(): void {
    this.bot.getCommandManager().unregister(this);
  }

  public async call(context: CommandContext): Promise<void> {
    const currentChannelType: 'text' | 'dm' =
      context.getMessage().channel.type === 'news' ? 'text' : (context.getMessage().channel.type as 'text' | 'dm');
    if (!this.runIn.includes(currentChannelType)) {
      // TODO: add error message
      return;
    }
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
    if (this.mode === 'subs') {
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
    } else if (this.mode === 'subswithfunc') {
      if (context.getArgs().length < 1) {
        this.run(context);
      } else {
        if (this[context.getArgs()[0]]) {
          const newContext = context.clone(context.getArgs()[0], Object.assign([], context.getArgs()).splice(1));
          this[context.getArgs()[0]](newContext);
        } else this.run(context);
      }
    } else if (this.mode === 'argument') {
      const rawArgs: string[] = Object.assign([], context.getArgs());
      const usageArgs: {
        argument?: Argument<any>;
        multiple?: boolean;
        need?: boolean;
      }[] = Object.assign([], this.usage.arguments);
      try {
        const objectArgs = await this.calcArgument(context, rawArgs, usageArgs);
        if (objectArgs.length > 0) this.run(context, objectArgs);
        else {
          // TODO: add error message
        }
      } catch (error) {
        if (error instanceof CommandError) {
          // TODO: add error message
          console.log(error);
          return;
        }
      }
    } else {
      this.run(context);
    }
  }

  private async calcArgument(
    context: CommandContext,
    rawArgs: string[],
    usageArgs: { argument?: Argument<any>; need?: boolean; multiple?: boolean }[]
  ): Promise<any[]> {
    const objectArgs: any[] = [];
    let skip = 0;
    for (const usageArg of usageArgs) {
      let added = false;
      if (rawArgs.length < 1) {
        if (!usageArg.argument.shift) {
          try {
            const controlledArg = await usageArg.argument.to(context, undefined);
            objectArgs.push(controlledArg);
            added = true;
          } catch (error) {}
        }
      } else {
        if (usageArg.multiple) {
          const multipleArgs: any[] = [];
          if (skip > 0) rawArgs = rawArgs.splice(skip);
          for (const arg of rawArgs) {
            try {
              const controlledArg = await usageArg.argument.to(context, arg);
              multipleArgs.push(controlledArg);
              skip++;
            } catch (error) {
              break;
            }
          }
          if (multipleArgs.length > 0) {
            objectArgs.push(multipleArgs);
            added = true;
          }
        } else {
          if (skip > 0) rawArgs = rawArgs.splice(skip);
          for (const arg of rawArgs) {
            try {
              const controlledArg = await usageArg.argument.to(context, arg);
              objectArgs.push(controlledArg);
              if (usageArg.argument.shift) skip++;
              added = true;
              break;
            } catch (error) {
              break;
            }
          }
        }
      }
      if (!added && usageArg.need) return [];
    }
    return objectArgs;
  }

  abstract run(context: CommandContext, args?: any): void;
}
