import * as Discord from 'discord.js';
import { SubscriptionContext } from './context/SubscriptionContext';

export type PredicateType<T> = (x: T) => void;

export class SubscriptionPredicate<K extends keyof Discord.ClientEvents> {
  constructor(private condition: PredicateType<SubscriptionContext<K>>) {}

  public static of = <K extends keyof Discord.ClientEvents>(condition: PredicateType<SubscriptionContext<K>>) => new SubscriptionPredicate(condition);

  public apply = (x: SubscriptionContext<K>): void => this.condition(x);
}
