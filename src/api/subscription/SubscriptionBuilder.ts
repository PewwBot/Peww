import * as Discord from 'discord.js';
import { Predicate, PredicateType } from '../../utils/Predicate';
import { Subscription } from './Subscription';
import { SubscriptionPredicate } from './SubscriptionPredicate';
import { SubscriptionImpl } from './SubscriptionImpl';

export class SubscriptionBuilder<K extends keyof Discord.ClientEvents> {
  private readonly event: K;
  private data: {
    name?: string;
    predicates?: SubscriptionPredicate<K>[];
  } = {
    predicates: [],
  };

  constructor(event: K) {
    this.event = event;
  }

  public static newBuilder<K extends keyof Discord.ClientEvents>(event: K): SubscriptionBuilder<K> {
    return new SubscriptionBuilder<K>(event);
  }

  public name(name: string): SubscriptionBuilder<K> {
    this.data.name = name;
    return this;
  }

  public filter(predicate: (sub: Subscription<K>, ...args: Discord.ClientEvents[K]) => boolean): SubscriptionBuilder<K> {
    this.data.predicates.push(predicate);
    return this;
  }

  public handler(handler: (sub: Subscription<K>, ...args: Discord.ClientEvents[K]) => void): Subscription<K> {
    return new SubscriptionImpl<K>(this.event, this.data.name, this.data.predicates, handler);
  }
}
