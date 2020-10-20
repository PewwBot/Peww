import * as Discord from 'discord.js';
import { Subscription } from './Subscription';

export type SubscriptionHandler<K extends keyof Discord.ClientEvents> = (sub?: Subscription<K>, ...arg: Discord.ClientEvents[K]) => void;
