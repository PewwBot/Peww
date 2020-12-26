import * as Discord from 'discord.js';
import { Database } from '../api/database/Database';
import { GuildEntity } from '../api/database/entity/GuildEntity';
import { GuildSettings } from '../api/database/entity/GuildSettingEntity';
import { PewwBot } from '../PewwBot';

export type PGuildData = {
  premium: boolean;
  command: {
    customPrefix: string[];
    defaultPrefix: boolean;
  };
  settings: GuildSettings[];
};

export class PewwGuild extends Discord.Guild {
  client: PewwBot;

  private customData: PGuildData = {
    premium: false,
    command: {
      customPrefix: [],
      defaultPrefix: true,
    },
    settings: [],
  };

  constructor(client: Discord.Client, data: object) {
    super(client, data);
  }

  public async load(createWhenNotCreated: boolean = true): Promise<void> {
    const repository = Database.getConnection().getRepository(GuildEntity);
    const guildEntityFromDatabase = await repository.findOne({ guildId: this.id });
    if (guildEntityFromDatabase) {
      this.customData.premium = guildEntityFromDatabase.premium;
      this.customData.command.customPrefix = guildEntityFromDatabase.customPrefix;
      this.customData.command.defaultPrefix = guildEntityFromDatabase.defaultPrefix;
    } else if (createWhenNotCreated) {
      const guildEntity = new GuildEntity();
      guildEntity.guildId = this.id;
      guildEntity.ownerId = this.ownerID;
      guildEntity.premium = this.customData.premium;
      guildEntity.customPrefix = this.customData.command.customPrefix;
      guildEntity.defaultPrefix = this.customData.command.defaultPrefix;
      await Database.getConnection().getRepository(GuildEntity).save(guildEntity);
    }
    await this.loadSettings();
  }

  public async loadSettings(): Promise<void> {
    const repository = Database.getConnection().getRepository(GuildSettings);
    const settings = await repository.find({ guildId: this.id });
    if (settings) {
      for (const setting of settings) {
        this.customData.settings.push(setting);
      }
    }
  }

  public async save(): Promise<void> {
    const queryRunner = Database.getConnection().createQueryRunner();
    await queryRunner.connect();
    try {
      let guildEntity = await queryRunner.manager.findOne(GuildEntity, { guildId: this.id });
      if (!guildEntity) {
        guildEntity = new GuildEntity();
        guildEntity.guildId = this.id;
      }
      guildEntity.ownerId = this.ownerID;
      guildEntity.premium = this.customData.premium;
      guildEntity.customPrefix = this.customData.command.customPrefix;
      guildEntity.defaultPrefix = this.customData.command.defaultPrefix;
      await queryRunner.startTransaction();
      let ret = true;
      try {
        await queryRunner.manager.save(guildEntity);
        if (this.customData.settings.length > 0) await queryRunner.manager.save(this.customData.settings);
        await queryRunner.commitTransaction();
      } catch (error) {
        this.client.getLogger().prettyError(error);
        await queryRunner.rollbackTransaction();
        ret = false;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      throw error;
    }
  }

  public isStaff(member: Discord.GuildMember, ownerControl: boolean = false): boolean {
    if (ownerControl && member.guild.ownerID === member.id) return true;
    const setting = this.customData.settings.find((setting) => setting.key === 'staffRoles');
    if (setting && setting.data) {
      const staffRoles = (setting.data as any).value as string[];
      if (!staffRoles || staffRoles.length < 1) return false;
      return staffRoles.some((staffRole) => member.roles.cache.has(staffRole));
    }
    return false;
  }

  getCustomData(): PGuildData {
    return this.customData;
  }
}

declare module 'discord.js' {
  class PewwGuild extends Discord.Guild {
    private pData: PGuildData;

    load(createWhenNotCreated?: boolean): Promise<void>;

    loadSettings(): Promise<void>;

    save(): Promise<void>;

    isStaff(member: Discord.GuildMember, ownerControl?: boolean): boolean;

    getCustomData(): PGuildData;
  }
}

Discord.Structures.extend('Guild', () => {
  return PewwGuild;
});
