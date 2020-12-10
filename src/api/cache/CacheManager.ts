import { PewwBot } from '../../PewwBot';
import { Cache } from './Cache';
import { Guild } from './Guild';
import { GuildCache } from './GuildCache';

export class CacheManager {
  private bot: PewwBot;
  private guildCache: GuildCache;

  constructor(bot: PewwBot) {
    this.bot = bot;
    this.guildCache = new GuildCache(this.bot);
  }

  public async getGuild(guildId: string, createWhenNotCreated: boolean = false): Promise<Guild | undefined> {
    return this.guildCache.get(guildId, createWhenNotCreated);
  }

  public getGuildCache(): Cache<Guild> {
    return this.guildCache;
  }

}
