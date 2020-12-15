import { Argument } from './argument/Argument';
import { Command } from './Command';

export abstract class CommandUsage {
  command: Command;
  arguments: {
    argument?: Argument<any>;
    multiple?: boolean;
    need: boolean;
    queue: number;
  }[] = [];

  abstract init(): void;

  public with(arg: Argument<any>, need?: boolean): void {
    this.arguments.push({
      argument: arg,
      multiple: false,
      need: need === undefined ? true : false,
      queue: this.arguments.length + 1
    });
    this.arguments = this.arguments.sort((a, b) => a.queue - b.queue);
  }

  public withName(argName: string, need?: boolean): void {
    const arg = this.command.bot.getArgumentManager().get(argName);
    if (!arg) return;
    this.arguments.push({
      argument: arg,
      multiple: false,
      need: need === undefined ? true : false,
      queue: this.arguments.length + 1
    });
    this.arguments = this.arguments.sort((a, b) => a.queue - b.queue);
  }

  public withMultiple(arg: Argument<any>, need?: boolean): void {
    this.arguments.push({
      argument: arg,
      multiple: true,
      need: need === undefined ? true : false,
      queue: this.arguments.length + 1
    });
    this.arguments = this.arguments.sort((a, b) => a.queue - b.queue);
  }

  public withMultipleName(argName: string, need?: boolean): void {
    const arg = this.command.bot.getArgumentManager().get(argName);
    if (!arg) return;
    this.arguments.push({
      argument: arg,
      multiple: true,
      need: need === undefined ? true : false,
      queue: this.arguments.length + 1
    });
    this.arguments = this.arguments.sort((a, b) => a.queue - b.queue);
  }

}
