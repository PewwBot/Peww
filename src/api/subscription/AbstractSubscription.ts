import * as Discord from 'discord.js';
import { v4 as uuidv4 } from 'uuid';
import { PewwBot } from '../../PewwBot';
import { ImmutableSubscriptionContext } from './context/ImmutableSubscriptionContext';
import { SubscriptionContext } from './context/SubscriptionContext';
import { Subscription } from './Subscription';
import { SubscriptionError } from './SubscriptionError';
import { SubscriptionPredicate } from './SubscriptionPredicate';

export abstract class AbstractSubscription<K extends keyof Discord.ClientEvents> implements Subscription<K> {
  bot: PewwBot;
  uniqueId: string = uuidv4();
  name: string;
  event: K;
  once: boolean = false;
  active: boolean = true;
  callCounter: number = 0;
  predicates: SubscriptionPredicate<K>[] = [];

  private listener: (...args: Discord.ClientEvents[K]) => void;

  constructor(args: { name: string }) {
    this.name = args.name;
  }

  public setupOptions(args?: { event?: K; once?: boolean; predicates?: SubscriptionPredicate<K>[] }) {
    if (args.event) this.event = args.event;
    if (args.once !== undefined) this.once = args.once;
    if (args.predicates) this.predicates = args.predicates;
  }

  abstract init(): void;

  register(): void {
    this.listener = (...args: Discord.ClientEvents[K]) => {
      if (!this.isActive()) return;

      this.callCounter++;
      this.call(new ImmutableSubscriptionContext(this.bot, args));
    };
    if (this.once) this.bot.once(this.event, this.listener);
    else this.bot.on(this.event, this.listener);
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
