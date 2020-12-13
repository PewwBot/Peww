import { CommandContext } from './context/CommandContext';

export type PredicateType<T> = (x: T) => void;

export class CommandPredicate {
  constructor(private condition: PredicateType<CommandContext>) {}

  public static of = (condition: PredicateType<CommandContext>) => new CommandPredicate(condition);

  public apply = (x: CommandContext): void => this.condition(x);
}
