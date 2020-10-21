import * as Discord from 'discord.js';
import { Bot } from './../Bot';
import { SubscriptionBatchRegisterer } from './../api/subscription/SubscriptionBatchRegisterer';

import * as util from 'util';
import { Subscription } from '../api/subscription/Subscription';
import { Subscriptions } from '../api/subscription/Subscriptions';
import { GuildEntity } from '../api/database/entity/GuildEntity';

export class GuildSubscriptions implements SubscriptionBatchRegisterer {
  get(): Subscription<any>[] {
    return [GUILD_CREATE];
  }
}

const GUILD_CREATE: Subscription<'guildCreate'> = Subscriptions.create('guildCreate')
  .name('guildCreate')
  .handler(async (sub, guild) => {
    const repository = Bot.getInstance().getDatabase().getConnection().getRepository(GuildEntity);
    if (!(await repository.findOne({ guildId: guild.id }))) {
      const guildEntity = new GuildEntity();
      guildEntity.guildId = guild.id;
      guildEntity.ownerId = guild.ownerID;
      guildEntity.premium = false;
      guildEntity.customPrefix = [];
      await repository.save(guildEntity);
      return;
    }
  });
