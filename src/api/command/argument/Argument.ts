import { PewwBot } from '../../../PewwBot';
import { CommandContext } from '../context/CommandContext';

export interface Argument<T> {
  bot: PewwBot;
  name: string;
  key: string;
  uniqueId: string;
  regex: RegExp;
  shift: boolean;

  init(): void;

  to(context: CommandContext, controlledArg: string | undefined): Promise<T>;
}
