import { Argument } from './argument/Argument';
import { Command } from './Command';
import { CommandError } from './CommandError';

export abstract class CommandUsage {
  command: Command;
  arguments: {
    argument?: Argument<any>;
    multiple?: boolean;
    need: boolean;
    queue: number;
  }[] = [];

  abstract init(): void;

  public with(
    arg: Argument<any>,
    options?: {
      need: boolean;
    }
  ): void {
    this.arguments.push({
      argument: arg,
      multiple: false,
      need: options ? (options.need === undefined ? true : options.need) : true,
      queue: this.arguments.length + 1,
    });
    this.arguments = this.arguments.sort((a, b) => a.queue - b.queue);
  }

  public withName(
    argName: string,
    options?: {
      need: boolean;
    }
  ): void {
    const arg = this.command.bot.getArgumentManager().get(argName);
    if (!arg) return;
    this.arguments.push({
      argument: arg,
      multiple: false,
      need: options ? (options.need === undefined ? true : options.need) : true,
      queue: this.arguments.length + 1,
    });
    this.arguments = this.arguments.sort((a, b) => a.queue - b.queue);
  }

  public withCustom(
    arg: Function,
    options?: {
      need: boolean;
    }
  ): void {
    const argumentObject: Argument<any> = new (arg as any)();
    argumentObject.bot = this.command.bot;
    try {
      argumentObject.init();
      this.arguments.push({
        argument: argumentObject,
        multiple: false,
        need: options ? (options.need === undefined ? true : options.need) : true,
        queue: this.arguments.length + 1,
      });
      this.arguments = this.arguments.sort((a, b) => a.queue - b.queue);
    } catch (error) {
      throw new CommandError('The custom argument is incorrect!');
    }
  }

  public withMultiple(
    arg: Argument<any>,
    options?: {
      need: boolean;
    }
  ): void {
    this.arguments.push({
      argument: arg,
      multiple: true,
      need: options ? (options.need === undefined ? true : options.need) : true,
      queue: this.arguments.length + 1,
    });
    this.arguments = this.arguments.sort((a, b) => a.queue - b.queue);
  }

  public withMultipleName(
    argName: string,
    options?: {
      need: boolean;
    }
  ): void {
    const arg = this.command.bot.getArgumentManager().get(argName);
    if (!arg) return;
    this.arguments.push({
      argument: arg,
      multiple: true,
      need: options ? (options.need === undefined ? true : options.need) : true,
      queue: this.arguments.length + 1,
    });
    this.arguments = this.arguments.sort((a, b) => a.queue - b.queue);
  }

  public withMultipleCustom(
    arg: Function,
    options?: {
      need: boolean;
    }
  ): void {
    const argumentObject: Argument<any> = new (arg as any)();
    argumentObject.bot = this.command.bot;
    try {
      argumentObject.init();
      this.arguments.push({
        argument: argumentObject,
        multiple: true,
        need: options ? (options.need === undefined ? true : options.need) : true,
        queue: this.arguments.length + 1,
      });
      this.arguments = this.arguments.sort((a, b) => a.queue - b.queue);
    } catch (error) {
      throw new CommandError('The custom argument is incorrect!');
    }
  }
}
