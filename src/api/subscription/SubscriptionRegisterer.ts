import { Registerer } from './../../utils/Registerer';
import * as Discord from 'discord.js';
import { Subscription } from './Subscription';

export abstract class SubscriptionRegisterer<K extends keyof Discord.ClientEvents> implements Registerer<Subscription<K>> {
  abstract get(): Subscription<K>;
}
