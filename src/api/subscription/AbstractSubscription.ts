import * as Discord from 'discord.js';
import { Subscription } from './Subscription';
import { PewwBot } from '../../PewwBot';
import { v4 as uuidv4 } from 'uuid';
import { SubscriptionContext } from './context/SubscriptionContext';
import { SubscriptionPredicate } from './SubscriptionPredicate';
import { ImmutableSubscriptionContext } from './context/ImmutableSubscriptionContext';
import { SubscriptionError } from './SubscriptionError';

export abstract class AbstractSubscription<K extends keyof Discord.ClientEvents> implements Subscription<K> {
  bot: PewwBot;
  uniqueId: string = uuidv4();
  event: K;
  name: string;
  active: boolean = true;
  callCounter: number = 0;
  predicates: SubscriptionPredicate<K>[];

  private listener: (...args: Discord.ClientEvents[K]) => void;

  constructor(args?: { event?: K; name?: string; predicates?: SubscriptionPredicate<K>[] }) {
    if (args.event) this.event = args.event;
    if (args.name) this.name = args.name;
    if (args.predicates) this.predicates = args.predicates;
  }

  init(): void {}

  register(): void {
    this.listener = (...args: Discord.ClientEvents[K]) => {
      if (!this.isActive()) {
        this.unregister();
        return;
      }

      this.callCounter++;
      this.call(new ImmutableSubscriptionContext(this.bot, args));
    };
    this.bot.on(this.event, this.listener);
  }

  unregister() {
    this.bot.off(this.event, this.listener);
  }

  call(context: SubscriptionContext<K>): void {
    if (this.predicates.length > 0) {
      for (const predicate of this.predicates) {
        try {
          predicate.apply(context);
        } catch (error) {
          if (error instanceof SubscriptionError) {
            // TODO: add error message
            console.log(error);
            return;
          }
        }
      }
    }
    this.run(context);
  }

  abstract run(context: SubscriptionContext<K>): void;

  isActive(): boolean {
    return this.active;
  }

  getCallCounter(): number {
    return this.callCounter;
  }
}
