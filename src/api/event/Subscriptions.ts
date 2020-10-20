import * as Discord from 'discord.js';
import { SubscriptionBuilder } from './SubscriptionBuilder';

export class Subscriptions {
  public static create<K extends keyof Discord.ClientEvents>(event: K): SubscriptionBuilder<K> {
    return SubscriptionBuilder.newBuilder(event);
  }
}
