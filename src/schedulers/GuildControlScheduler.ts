import { GuildEntity } from './../api/database/entity/GuildEntity';
import { Schedulers } from './../api/scheduler/Schedulers';
import { Scheduler } from '../api/scheduler/Scheduler';
import { SchedulerRegisterer } from './../api/scheduler/SchedulerRegisterer';
import { Bot } from '../Bot';

import moment from 'moment';

export class GuildControlScheduler implements SchedulerRegisterer {
  get(): Scheduler {
    return Schedulers.create('GuildControl')
      .msMoment(moment.duration(15, 'minutes'))
      .handler(async () => {
        const queryRunner = Bot.getInstance().getDatabase().getConnection().createQueryRunner();
        await queryRunner.connect();
        const guildEntities = await queryRunner.manager.find(GuildEntity);
        const needRemoveGuilds: GuildEntity[] = [];
        const needAddGuilds: GuildEntity[] = [];
        if (!(!guildEntities || guildEntities.length < 1)) {
          for (const guildEntity of guildEntities) {
            if (Bot.getInstance().getClient().guilds.cache.get(guildEntity.guildId)) continue;
            needRemoveGuilds.push(guildEntity);
          }
        }
        for (const guild of Bot.getInstance().getClient().guilds.cache.values()) {
          if (
            guildEntities.some((guildEntity) => {
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
          Bot.getInstance().getLogger().prettyError(error);
          await queryRunner.rollbackTransaction();
        } finally {
          await queryRunner.release();
        }
      });
  }
}
