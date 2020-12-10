import * as Discord from 'discord.js';
import { PewwBot } from '../../PewwBot';
import { GuildEntity } from '../database/entity/GuildEntity';
import { GuildSettings } from '../database/entity/GuildSettingEntity';

export class Guild {
  private readonly bot: PewwBot;
  guildId: string;
  ownerId: string;
  premium: boolean = false;
  customPrefix: string[] = [];
  defaultPrefix: boolean = true;
  settings: GuildSettings[] = [];

  constructor(
    bot: PewwBot,
    args?: { guildId: string; ownerId: string; premium: boolean; customPrefix: string[]; defaultPrefix: boolean }
  ) {
    this.bot = bot;
    if (!args) return;
    this.guildId = args.guildId;
    this.ownerId = args.ownerId;
    this.premium = args.premium;
    this.customPrefix = args.customPrefix;
    this.defaultPrefix = args.defaultPrefix;
  }

  public async load(): Promise<boolean> {
    const repository = this.bot.getDatabase().getConnection().getRepository(GuildEntity);
    const guildEntityFromDatabase = await repository.findOne({ guildId: this.getGuildId() });
    if (guildEntityFromDatabase) {
      this.guildId = guildEntityFromDatabase.guildId;
      this.ownerId = guildEntityFromDatabase.ownerId;
      this.premium = guildEntityFromDatabase.premium;
      this.customPrefix = guildEntityFromDatabase.customPrefix;
      this.defaultPrefix = guildEntityFromDatabase.defaultPrefix;
      return await this.loadSettings();
    }
    return false;
  }

  public async loadSettings(): Promise<boolean> {
    const repository = this.bot.getDatabase().getConnection().getRepository(GuildSettings);
    const settings = await repository.find({ guildId: this.getGuildId() });
    if (settings) {
      for (const setting of settings) {
        this.settings.push(setting);
      }
    }
    return true;
  }

  public async save(): Promise<boolean> {
    const queryRunner = this.bot.getDatabase().getConnection().createQueryRunner();
    await queryRunner.connect();
    try {
      let guildEntity = await queryRunner.manager.findOne(GuildEntity, { guildId: this.getGuildId() });
      if (!guildEntity) {
        guildEntity = new GuildEntity();
        guildEntity.guildId = this.guildId;
      }
      guildEntity.ownerId = this.ownerId;
      guildEntity.premium = this.premium;
      guildEntity.customPrefix = this.customPrefix;
      guildEntity.defaultPrefix = this.defaultPrefix;
      await queryRunner.startTransaction();
      let ret = true;
      try {
        await queryRunner.manager.save(guildEntity);
        if (this.settings.length > 0) await queryRunner.manager.save(this.settings);
        await queryRunner.commitTransaction();
      } catch (error) {
        this.bot.getLogger().prettyError(error);
        await queryRunner.rollbackTransaction();
        ret = false;
      } finally {
        await queryRunner.release();
      }
      return ret;
    } catch (error) {
      return false;
    }
  }

  public isStaff(member: Discord.GuildMember, ownerControl: boolean = false): boolean {
    if (ownerControl && member.guild.ownerID === member.id) return true;
    const setting = this.settings.find((setting) => setting.key === 'staffRoles');
    if (setting && setting.data) {
      const staffRoles = (setting.data as any).value as string[];
      if (!staffRoles || staffRoles.length < 1) return false;
      return staffRoles.some((staffRole) => member.roles.cache.has(staffRole));
    }
    return false;
  }

  public async getGuild(): Promise<Discord.Guild | undefined> {
    if (!this.guildId) return null;
    let guild = this.bot.guilds.cache.get(this.getGuildId());
    if (!guild) {
      guild = await this.bot.guilds.fetch(this.getGuildId());
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

  public getDefaultPrefix(): boolean {
    return this.defaultPrefix;
  }

  public getSettings(): GuildSettings[] {
    return this.settings;
  }
}
