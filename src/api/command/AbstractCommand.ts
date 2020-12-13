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

export abstract class AbstractCommand implements Command {
  bot: PewwBot;
  uniqueId: string = uuidv4();
  name: string;
  mode: 'normal' | 'subs' | 'subswithfunc' = 'normal';
  cooldown: { time: number; message: string | MessageEmbed } = undefined;
  subs: SubCommand[] = [];
  runIn: ['text', 'dm'] = ['text', 'dm'];
  category: CommandCategory = CommandCategory.OTHER;
  description: string = '';
  usage: string = '';
  aliases: string[] = [];
  requiredPermissions: PermissionString[] = [];
  requiredCustomPermission: CommandPermission = CommandPermissions.USER;
  predicates: CommandPredicate[] = [];

  [func: string]: any;

  constructor(
    args: {
      name?: string;
      mode?: 'normal' | 'subs' | 'subswithfunc';
      cooldown?: { time: number; message: string | MessageEmbed };
      subs?: Function[];
      runIn?: ['text', 'dm'];
      category?: CommandCategory;
      description?: string;
      usage?: string;
      aliases?: string[];
      requiredPermissions?: PermissionString[];
      requiredCustomPermission?: CommandPermission;
      predicates?: CommandPredicate[];
    } = {}
  ) {
    if (args.name) this.name = args.name;
    if (args.mode) this.mode = args.mode;
    if (args.cooldown) this.cooldown = args.cooldown;
    if (args.subs) {
      for (const subFunction of args.subs) {
        const sub: SubCommand = new (subFunction as any)();
        sub.command = this;
        sub.init();
        this.setupAllSubs(sub);
        this.subs.push(sub);
      }
    }
    if (args.runIn) this.runIn = args.runIn;
    if (args.category) this.category = args.category;
    if (args.description) this.description = args.description;
    if (args.usage) this.usage = args.usage;
    if (args.aliases) this.aliases = args.aliases;
    if (args.requiredPermissions) this.requiredPermissions = args.requiredPermissions;
    if (args.requiredCustomPermission) this.requiredCustomPermission = args.requiredCustomPermission;
    if (args.predicates) this.predicates = args.predicates;
  }

  private setupAllSubs(_sub: SubCommand): void {
    for (const sub of _sub.subs) {
      sub.command = this;
      sub.init();
      if (sub.subs.length > 0) this.setupAllSubs(sub);
    }
  }

  init(): void {}

  public register(): void {
    this.bot.getCommandManager().register(this);
  }

  public unregister(): void {
    this.bot.getCommandManager().unregister(this);
  }

  public call(context: CommandContext): void {
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
    } else {
      this.run(context);
    }
  }

  abstract run(context: CommandContext): void;
}
