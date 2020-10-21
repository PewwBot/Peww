import * as Discord from 'discord.js';
import { Subscription } from './Subscription';

export type SubscriptionPredicate<K extends keyof Discord.ClientEvents> = (sub?: Subscription<K>, ...args: Discord.ClientEvents[K]) => boolean;
