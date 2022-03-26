import { CommandContext } from "../../types";

export type Predicate<T> = (x: T) => void;

export class CommandPredicate {
  constructor(private condition: Predicate<CommandContext>) { }

  public static of = (condition: Predicate<CommandContext>) => new CommandPredicate(condition);

  public apply = (x: CommandContext): void => this.condition(x);
}