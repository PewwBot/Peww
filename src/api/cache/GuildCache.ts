import { PewwBot } from '../../PewwBot';
import { GuildEntity } from '../database/entity/GuildEntity';
import { Cache } from './Cache';
import { Guild } from './Guild';

export class GuildCache extends Cache<Guild> {
  private bot: PewwBot;

  constructor(bot: PewwBot) {
    super();
    this.bot = bot;
  }

  public async get(guildId: string, createWhenNotCreated: boolean = false): Promise<Guild | undefined> {
    let guild = this.getData().get(guildId);
    if (!guild) {
      let orgGuild = this.bot.guilds.cache.get(guildId);
      if (!orgGuild) orgGuild = await this.bot.guilds.fetch(guildId);
      if (!orgGuild) return null;
      guild = new Guild(this.bot, {
        guildId,
        ownerId: orgGuild.ownerID,
        premium: false,
        customPrefix: [],
        defaultPrefix: true,
      });
      if (!(await guild.load())) {
        if (createWhenNotCreated) {
          const guildEntity = new GuildEntity();
          guildEntity.guildId = guild.guildId;
          guildEntity.ownerId = guild.ownerId;
          guildEntity.premium = guild.premium;
          guildEntity.customPrefix = guild.customPrefix;
          guildEntity.defaultPrefix = guild.defaultPrefix;
          await this.bot.getDatabase().getConnection().getRepository(GuildEntity).save(guildEntity);
          this.getData().set(guildId, guild);
          return guild;
        }
        return null;
      }
      this.getData().set(guildId, guild);
      return guild;
    }
    return guild;
  }
}
