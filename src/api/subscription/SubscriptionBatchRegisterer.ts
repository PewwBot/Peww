import { BatchRegisterer } from './../../utils/BatchRegisterer';
import * as Discord from 'discord.js';
import { Subscription } from './Subscription';

export interface SubscriptionBatchRegisterer extends BatchRegisterer<Subscription<any>> {}
