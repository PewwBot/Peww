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
        if (!guildEntities || guildEntities.length < 1) return;
        const needRemoveGuilds: GuildEntity[] = [];
        for (const guildEntity of guildEntities) {
          if (Bot.getInstance().getClient().guilds.cache.get(guildEntity.guildId)) continue;
          needRemoveGuilds.push(guildEntity);
        }
        if (needRemoveGuilds.length < 1) {
          queryRunner.release();
          return;
        }
        await queryRunner.startTransaction();
        try {
          await queryRunner.manager.remove(needRemoveGuilds);
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
