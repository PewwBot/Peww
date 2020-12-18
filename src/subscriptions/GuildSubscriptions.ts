import * as Discord from 'discord.js';

import { Subscription } from '../api/subscription/Subscription';
import { GuildEntity } from '../api/database/entity/GuildEntity';
import { Database } from '../api/database/Database';
import { AbstractSubscription } from '../api/subscription/AbstractSubscription';
import { SubscriptionContext } from '../api/subscription/context/SubscriptionContext';
import { SubscriptionBatchRegisterer } from '../api/subscription/SubscriptionBatchRegisterer';
import { PewwGuild } from '../structures/GuildStructure';

export class GuildSubscriptions extends SubscriptionBatchRegisterer {
  get(): Subscription<any>[] {
    return [new GuildMemberAdd(), new GuildMemberRemove(), new GuildCreate(), new GuildDelete()];
  }
}

export default GuildSubscriptions;

class GuildMemberAdd extends AbstractSubscription<'guildMemberAdd'> {
  constructor() {
    super({
      name: 'guildMemberAdd',
    });
  }

  init(): void {
    this.setupOptions({
      event: 'guildMemberAdd',
    });
  }

  async run(context: SubscriptionContext<'guildMemberAdd'>): Promise<void> {
    const guild: PewwGuild = (await this.bot.guilds.cache.get(context.getParams()[0].guild.id)) as PewwGuild;
    if (guild) {
      await guild.load();
      const setting = guild.getPData().settings.find((setting) => setting.key === 'entry');
      if (
        !setting ||
        (setting &&
          (!setting.data ||
            !(setting.data as any).channelId ||
            !(setting.data as any).join.mode ||
            !(setting.data as any).join.message))
      )
        return;
      const channel = context
        .getParams()[0]
        .guild.channels.cache.get((setting.data as any).channelId) as Discord.TextChannel;
      if (!channel) return;
      if (!['off', 'embed', 'message'].includes((setting.data as any).join.mode)) return;
      const mode: 'off' | 'embed' | 'message' = (setting.data as any).join.mode;
      if (mode === 'off') return;
      const rawMessage: string = (setting.data as any).join.message;
      const message: string | Discord.MessageEmbed =
        mode === 'message'
          ? rawMessage
          : new Discord.MessageEmbed()
              .setDescription(rawMessage)
              .setColor('#7ffc03')
              .setThumbnail(context.getParams()[0].user.displayAvatarURL())
              .setTimestamp()
              .setTitle('Katılım Bilgilendirme');
      channel.send(message);
    }
  }
}

class GuildMemberRemove extends AbstractSubscription<'guildMemberRemove'> {
  constructor() {
    super({
      name: 'guildMemberRemove',
    });
  }

  init(): void {
    this.setupOptions({
      event: 'guildMemberRemove',
    });
  }

  async run(context: SubscriptionContext<'guildMemberRemove'>): Promise<void> {
    const guild: PewwGuild = (await this.bot.guilds.cache.get(context.getParams()[0].guild.id)) as PewwGuild;
    if (guild) {
      await guild.load();
      const setting = guild.getPData().settings.find((setting) => setting.key === 'entry');
      if (
        !setting ||
        (setting &&
          (!setting.data ||
            !(setting.data as any).channelId ||
            !(setting.data as any).join.mode ||
            !(setting.data as any).join.message))
      )
        return;
      const channel = context
        .getParams()[0]
        .guild.channels.cache.get((setting.data as any).channelId) as Discord.TextChannel;
      if (!channel) return;
      if (!['off', 'embed', 'message'].includes((setting.data as any).leave.mode)) return;
      const mode: 'off' | 'embed' | 'message' = (setting.data as any).leave.mode;
      if (mode === 'off') return;
      const rawMessage: string = (setting.data as any).leave.message;
      const message: string | Discord.MessageEmbed =
        mode === 'message'
          ? rawMessage
          : new Discord.MessageEmbed()
              .setDescription(rawMessage)
              .setColor('#db1212')
              .setThumbnail(context.getParams()[0].user.displayAvatarURL())
              .setTimestamp()
              .setTitle('Katılım Bilgilendirme');
      channel.send(message);
    }
  }
}

class GuildCreate extends AbstractSubscription<'guildCreate'> {
  constructor() {
    super({
      name: 'guildCreate',
    });
  }

  init(): void {
    this.setupOptions({
      event: 'guildCreate',
    });
  }

  async run(context: SubscriptionContext<'guildCreate'>): Promise<void> {
    const repository = Database.getConnection().getRepository(GuildEntity);
    if (!(await repository.findOne({ guildId: context.getParams()[0].id }))) {
      const guildEntity = new GuildEntity();
      guildEntity.guildId = context.getParams()[0].id;
      guildEntity.ownerId = context.getParams()[0].ownerID;
      guildEntity.premium = false;
      guildEntity.customPrefix = [];
      guildEntity.defaultPrefix = true;
      await repository.save(guildEntity);
      return;
    }
  }
}

class GuildDelete extends AbstractSubscription<'guildDelete'> {
  constructor() {
    super({
      name: 'guildDelete',
    });
  }

  init(): void {
    this.setupOptions({
      event: 'guildDelete',
    });
  }

  async run(context: SubscriptionContext<'guildDelete'>): Promise<void> {
    const repository = Database.getConnection().getRepository(GuildEntity);
    const guildEntity = await repository.findOne({ guildId: context.getParams()[0].id });
    if (guildEntity) repository.remove(guildEntity);
  }
}
