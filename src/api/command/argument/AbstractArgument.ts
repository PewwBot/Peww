import { v4 as uuidv4 } from 'uuid';
import { PewwBot } from '../../../PewwBot';
import { CommandContext } from '../context/CommandContext';
import { Argument } from './Argument';

export abstract class AbstractArgument<T> implements Argument<T> {
  bot: PewwBot;
  name: string;
  uniqueId: string = uuidv4();
  regex: RegExp = undefined;
  shift: boolean = true;

  constructor(args: { name: string }) {
    this.name = args.name;
  }

  public setupOptions(args?: { regex?: RegExp; shift?: boolean }) {
    if (args.regex) this.regex = args.regex;
    if (args.shift !== undefined) this.shift = args.shift;
  }

  abstract init(): void;

  abstract to(context: CommandContext, controlledArg: string): Promise<T>;
}
