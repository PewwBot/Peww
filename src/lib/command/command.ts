import { BotClient, CommandContext, CommandOptions } from '../../types';
import { CommandCategory } from './commandCategory';
import { CommandError } from './commandError';
import { CommandMethods } from './commandMethods';
import { CommandPermissions } from './commandPermission';

export abstract class Command {
  public config: CommandOptions;

  constructor(protected client: BotClient, options: CommandOptions) {
    this.config = {
      name: options.name,
      description: options.description || 'No information specified.',
      usage: options.usage || 'No usage specified.',
      category: options.category || CommandCategory.OTHER,
      aliases: [],
      runIn: ['text', 'dm'],
      cooldown: {
        time: options.cooldown.time || 1000,
        message: '',
      },
      requiredBotPermissions: options.requiredBotPermissions || ['SEND_MESSAGES'],
      requiredPermission: CommandPermissions.USER,
      predicates: [],
      methods: new CommandMethods(this),
    };
  }

  abstract init(): void;

  unregister() { }

  async call(context: CommandContext): Promise<void> {
    const currentChannelType: 'text' | 'dm' =
      context.message.channel.type === 'GUILD_NEWS' ? 'text' : (context.message.channel.type === 'GUILD_TEXT' ? 'text' : 'dm');
    if (!this.config.runIn.includes(currentChannelType)) {
      this.config.methods.sendErrorMessage(context, 'Command Failure', 'You cannot use this command in this room');
      return;
    }
    if (this.config.predicates.length > 0) {
      for (const predicate of this.config.predicates) {
        try {
          predicate.apply(context);
        } catch (error) {
          if (error instanceof CommandError) {
            this.config.methods.sendErrorMessage(context, 'Command Failure', error.message);
            console.log(error);
            return;
          }
        }
      }
    }
    if (this.config.requiredBotPermissions.length > 0) {
      for (const permission of this.config.requiredBotPermissions) {
        if (!context.message.guild.me.permissions.has(permission)) return;
      }
    }
    if (this.config.requiredPermission) {
      try {
        this.config.requiredPermission.test(context);
      } catch (error) {
        if (error instanceof CommandError) {
          this.config.methods.sendErrorMessage(context, 'Command Failure', error.message);
          console.log(error);
          return;
        }
      }
    }
    try {
      await this.test(context);
    } catch (error) {
      if (error instanceof CommandError) {
        this.config.methods.sendErrorMessage(context, 'Command Failure', error.message);
        console.log(error);
        return;
      }
    }
    this.run(context);
  }

  abstract test(context: CommandContext, args?: any): Promise<void>;

  abstract run(context: CommandContext, args?: any): void;
}
