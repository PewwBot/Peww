import * as Discord from 'discord.js';
import { Bot } from '../../Bot';
import { GuildEntity } from '../database/entity/GuildEntity';

export class Guild {
  guildId: string;
  ownerId: string;
  premium: boolean = false;
  customPrefix: string[] = [];

  constructor(args?: { guildId: string; ownerId: string; premium: boolean; customPrefix: string[] }) {
    if (!args) return;
    this.guildId = args.guildId;
    this.ownerId = args.ownerId;
    this.premium = args.premium;
    this.customPrefix = args.customPrefix;
  }

  public static async get(guildId: string, createWhenNotCreated: boolean = false): Promise<Guild | undefined> {
    let guild = Bot.getInstance().getCacheManager().getGuildCache().getData().get(guildId);
    if (!guild) {
      let orgGuild = Bot.getInstance().getClient().guilds.cache.get(guildId);
      if (!orgGuild) orgGuild = await Bot.getInstance().getClient().guilds.fetch(guildId);
      if (!orgGuild) return null;
      guild = new Guild({
        guildId,
        ownerId: orgGuild.ownerID,
        premium: false,
        customPrefix: [],
      });
      if (!await guild.load()) {
        if (createWhenNotCreated) {
          const guildEntity = new GuildEntity();
          guildEntity.guildId = guild.guildId;
          guildEntity.ownerId = guild.ownerId;
          guildEntity.premium = guild.premium;
          guildEntity.customPrefix = guild.customPrefix;
          await Bot.getInstance().getDatabase().getConnection().getRepository(GuildEntity).save(guildEntity);
          Bot.getInstance().getCacheManager().getGuildCache().getData().set(guildId, guild);
          return guild;
        }
        return null;
      }
      Bot.getInstance().getCacheManager().getGuildCache().getData().set(guildId, guild);
      return guild;
    }
    return guild;
  }

  public async load(): Promise<boolean> {
    const repository = Bot.getInstance().getDatabase().getConnection().getRepository(GuildEntity);
    const guildEntityFromDatabase = await repository.findOne({ guildId: this.getGuildId() });
    if (guildEntityFromDatabase) {
      this.guildId = guildEntityFromDatabase.guildId;
      this.ownerId = guildEntityFromDatabase.ownerId;
      this.premium = guildEntityFromDatabase.premium;
      this.customPrefix = guildEntityFromDatabase.customPrefix;
      return true;
    }
    return false;
  }

  public async save(): Promise<boolean> {
    const repository = Bot.getInstance().getDatabase().getConnection().getRepository(GuildEntity);
    try {
      let guildEntity = await repository.findOne({ guildId: this.getGuildId() });
      if (!guildEntity) {
        guildEntity = new GuildEntity();
        guildEntity.guildId = this.guildId;
      }
      guildEntity.ownerId = this.ownerId;
      guildEntity.premium = this.premium;
      guildEntity.customPrefix = this.customPrefix;
      await repository.save(guildEntity);
      return true;
    } catch (error) {
      return false;
    }
  }

  public async getGuild(): Promise<Discord.Guild | undefined> {
    if (!this.guildId) return null;
    let guild = Bot.getInstance().getClient().guilds.cache.get(this.getGuildId());
    if (!guild) {
      guild = await Bot.getInstance().getClient().guilds.fetch(this.getGuildId());
      if (!guild) return null;
    }
    return guild;
  }

  public getGuildId(): string {
    return this.guildId;
  }

  public getOwnerId(): string {
    return this.ownerId;
  }

  public isPremium(): boolean {
    return this.premium;
  }

  public getCustomPrefix(): string[] {
    return this.customPrefix;
  }
}
