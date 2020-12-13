import * as Discord from 'discord.js';
import { PewwBot } from '../../../PewwBot';


export interface SubscriptionContext<K extends keyof Discord.ClientEvents> {
  getBot(): PewwBot;

  getParams(): Discord.ClientEvents[K];
}
