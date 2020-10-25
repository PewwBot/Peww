import { Cache } from './Cache';
import { Guild } from './Guild';

export class CacheManager {
  private guildCache: Cache<Guild> = Cache.of();

  public async getGuild(guildId: string, createWhenNotCreated: boolean = false): Promise<Guild | undefined> {
    return Guild.get(guildId, createWhenNotCreated);
  }

  public getGuildCache(): Cache<Guild> {
    return this.guildCache;
  }

}
