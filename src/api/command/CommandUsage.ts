import { Argument } from './argument/Argument';
import { Command } from './Command';
import { CommandError } from './CommandError';

export abstract class CommandUsage {
  command: Command;
  arguments: {
    argument: Argument<any>;
    multiple: boolean;
    customName?: string;
    formatMode: 'normal' | 'array';
    need: boolean;
    queue: number;
  }[] = [];

  abstract init(): void;

  public with(
    arg: Argument<any>,
    options?: {
      need?: boolean;
      customName?: string;
      formatMode?: 'normal' | 'array';
    }
  ): void {
    this.arguments.push({
      argument: arg,
      multiple: false,
      customName: options ? (options.customName ? options.customName : undefined) : undefined,
      formatMode: options ? (options.formatMode ? options.formatMode : 'normal') : 'normal',
      need: options ? (options.need === undefined ? true : options.need) : true,
      queue: this.arguments.length + 1,
    });
    this.arguments = this.arguments.sort((a, b) => a.queue - b.queue);
  }

  public withName(
    argName: string,
    options?: {
      need?: boolean;
      customName?: string;
      formatMode?: 'normal' | 'array';
    }
  ): void {
    const arg = this.command.bot.getArgumentManager().get(argName);
    if (!arg) return;
    this.arguments.push({
      argument: arg,
      multiple: false,
      customName: options ? (options.customName ? options.customName : undefined) : undefined,
      formatMode: options ? (options.formatMode ? options.formatMode : 'normal') : 'normal',
      need: options ? (options.need === undefined ? true : options.need) : true,
      queue: this.arguments.length + 1,
    });
    this.arguments = this.arguments.sort((a, b) => a.queue - b.queue);
  }

  public withCustom(
    arg: Function,
    options?: {
      need?: boolean;
      customName?: string;
      formatMode?: 'normal' | 'array';
    }
  ): void {
    const argumentObject: Argument<any> = new (arg as any)();
    argumentObject.bot = this.command.bot;
    try {
      argumentObject.init();
      this.arguments.push({
        argument: argumentObject,
        multiple: false,
        customName: options ? (options.customName ? options.customName : undefined) : undefined,
        formatMode: options ? (options.formatMode ? options.formatMode : 'normal') : 'normal',
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
      need?: boolean;
      customName?: string;
      formatMode?: 'normal' | 'array';
    }
  ): void {
    this.arguments.push({
      argument: arg,
      multiple: true,
      customName: options ? (options.customName ? options.customName : undefined) : undefined,
      formatMode: options ? (options.formatMode ? options.formatMode : 'normal') : 'normal',
      need: options ? (options.need === undefined ? true : options.need) : true,
      queue: this.arguments.length + 1,
    });
    this.arguments = this.arguments.sort((a, b) => a.queue - b.queue);
  }

  public withMultipleName(
    argName: string,
    options?: {
      need?: boolean;
      customName?: string;
      formatMode?: 'normal' | 'array';
    }
  ): void {
    const arg = this.command.bot.getArgumentManager().get(argName);
    if (!arg) return;
    this.arguments.push({
      argument: arg,
      multiple: true,
      customName: options ? (options.customName ? options.customName : undefined) : undefined,
      formatMode: options ? (options.formatMode ? options.formatMode : 'normal') : 'normal',
      need: options ? (options.need === undefined ? true : options.need) : true,
      queue: this.arguments.length + 1,
    });
    this.arguments = this.arguments.sort((a, b) => a.queue - b.queue);
  }

  public withMultipleCustom(
    arg: Function,
    options?: {
      need?: boolean;
      customName?: string;
      formatMode?: 'normal' | 'array';
    }
  ): void {
    const argumentObject: Argument<any> = new (arg as any)();
    argumentObject.bot = this.command.bot;
    try {
      argumentObject.init();
      this.arguments.push({
        argument: argumentObject,
        multiple: true,
        customName: options ? (options.customName ? options.customName : undefined) : undefined,
        formatMode: options ? (options.formatMode ? options.formatMode : 'normal') : 'normal',
        need: options ? (options.need === undefined ? true : options.need) : true,
        queue: this.arguments.length + 1,
      });
      this.arguments = this.arguments.sort((a, b) => a.queue - b.queue);
    } catch (error) {
      throw new CommandError('The custom argument is incorrect!');
    }
  }

  public toUsageString(): string {
    if (this.arguments.length < 0) return '';
    let usageString = '';
    for (const argument of this.arguments) {
      if (!argument.argument.shift) continue;
      usageString += `${
        argument.formatMode === 'normal'
          ? `${argument.need ? '<' : '['}${
              argument.multiple
                ? `...${argument.customName ? argument.customName : '_'}:${argument.argument.format.type}`
                : `${argument.customName ? argument.customName : '_'}:${argument.argument.format.type}`
            }${argument.need ? '>' : ']'}`
          : `${argument.need ? '<' : '['}${`${argument.customName ? argument.customName : '_'}`}${
              argument.need ? '>' : ']'
            }`
      }`;
    }
    return usageString;
  }

  public toString(): string {
    return this.toUsageString();
  }
}
