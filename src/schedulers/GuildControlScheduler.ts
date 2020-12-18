import moment from 'moment';
import { Database } from '../api/database/Database';
import { AbstractScheduler } from '../api/scheduler/AbstractScheduler';
import { GuildEntity } from './../api/database/entity/GuildEntity';

export class GuildControlScheduler extends AbstractScheduler {
  constructor() {
    super({
      name: 'GuildControl',
    });
  }

  init(): void {
    this.setupOptions({
      ms: moment.duration(15, 'minutes'),
    });
  }

  async run(): Promise<void> {
    const queryRunner = Database.getConnection().createQueryRunner();
    await queryRunner.connect();
    const guildEntities = await queryRunner.manager.find(GuildEntity);
    const needRemoveGuilds: GuildEntity[] = [];
    const needAddGuilds: GuildEntity[] = [];
    if (!(!guildEntities || guildEntities.length < 1)) {
      for (const guildEntity of guildEntities) {
        if (this.bot.guilds.cache.get(guildEntity.guildId)) continue;
        needRemoveGuilds.push(guildEntity);
      }
    }
    for (const guild of this.bot.guilds.cache.values()) {
      if (
        guildEntities.some((guildEntity: { guildId: any }) => {
          return guildEntity.guildId === guild.id;
        })
      )
        continue;
      const newGuildEntity = new GuildEntity();
      newGuildEntity.guildId = guild.id;
      newGuildEntity.ownerId = guild.ownerID;
      newGuildEntity.premium = false;
      newGuildEntity.customPrefix = [];
      newGuildEntity.defaultPrefix = true;
      needAddGuilds.push(newGuildEntity);
    }
    if (needRemoveGuilds.length < 1 && needAddGuilds.length < 1) {
      queryRunner.release();
      return;
    }
    await queryRunner.startTransaction();
    try {
      if (needRemoveGuilds.length > 0) await queryRunner.manager.remove(needRemoveGuilds);
      if (needAddGuilds.length > 0) await queryRunner.manager.save(needAddGuilds);
      await queryRunner.commitTransaction();
    } catch (error) {
      this.bot.getLogger().prettyError(error);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
