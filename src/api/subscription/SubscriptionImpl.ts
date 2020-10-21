import * as Discord from 'discord.js';
import { Subscription } from './Subscription';

import { SubscriptionHandler } from './SubscriptionHandler';
import { SubscriptionPredicate } from './SubscriptionPredicate';
import { Bot } from '../../Bot';

export class SubscriptionImpl<K extends keyof Discord.ClientEvents> implements Subscription<K> {
  event: K;
  name: string;
  active: boolean = true;
  callCounter: number = 0;

  private listener: (...args: Discord.ClientEvents[K]) => void;

  private readonly predicates: SubscriptionPredicate<K>[];
  private readonly handler: SubscriptionHandler<K>;

  constructor(event: K, name: string, predicates: SubscriptionPredicate<K>[], handler: SubscriptionHandler<K>) {
    this.event = event;
    this.name = name;
    this.predicates = predicates;
    this.handler = handler;
  }

  register(): void {
    this.listener = (...args: Discord.ClientEvents[K]) => {
      if (!this.isActive()) {
        this.unregister();
        return;
      }

      for (const predicate of this.predicates) {
        if (!predicate(this, ...args)) return;
      }

      this.callCounter++;
      this.handler(this, ...args);
    };
    Bot.getInstance().getClient().on(this.event, this.listener);
  }

  unregister() {
    Bot.getInstance().getClient().off(this.event, this.listener);
  }

  isActive(): boolean {
    return this.active;
  }
  getCallCounter(): number {
    return this.callCounter;
  }
}
