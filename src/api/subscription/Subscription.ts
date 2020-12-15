import * as Discord from 'discord.js';
import { PewwBot } from '../../PewwBot';
import { SubscriptionContext } from './context/SubscriptionContext';
import { SubscriptionPredicate } from './SubscriptionPredicate';

export interface Subscription<K extends keyof Discord.ClientEvents> {
  bot: PewwBot;
  uniqueId: string;
  name: string;
  event: K;
  once: boolean;
  active: boolean;
  callCounter: number;
  predicates: SubscriptionPredicate<K>[];

  init(): void;

  register(): void;

  unregister(): void;

  call(context: SubscriptionContext<K>): void;

  run(context: SubscriptionContext<K>): void;

  isActive(): boolean;

  getCallCounter(): number;
}