import { Registerer } from './../../utils/Registerer';
import * as Discord from 'discord.js';
import { Subscription } from './Subscription';

export interface SubscriptionRegisterer<K extends keyof Discord.ClientEvents> extends Registerer<Subscription<K>> {}
