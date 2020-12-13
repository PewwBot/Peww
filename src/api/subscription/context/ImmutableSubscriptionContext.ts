import * as Discord from 'discord.js';
import { PewwBot } from '../../../PewwBot';
import { SubscriptionContext } from './SubscriptionContext';

export class ImmutableSubscriptionContext<K extends keyof Discord.ClientEvents> implements SubscriptionContext<K> {
  private readonly bot: PewwBot;
  private readonly params: Discord.ClientEvents[K];

  constructor(bot: PewwBot, params: Discord.ClientEvents[K]) {
    this.bot = bot;
    this.params = params;
  }

  getBot(): PewwBot {
    return this.bot;
  }

  getParams(): Discord.ClientEvents[K] {
    return this.params;
  }
}
