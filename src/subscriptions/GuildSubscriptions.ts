import * as Discord from 'discord.js';
import { PewwBot } from '../PewwBot';
import { SubscriptionBatchRegisterer } from './../api/subscription/SubscriptionBatchRegisterer';

import { Subscription } from '../api/subscription/Subscription';
import { Subscriptions } from '../api/subscription/Subscriptions';
import { GuildEntity } from '../api/database/entity/GuildEntity';

export class GuildSubscriptions implements SubscriptionBatchRegisterer {
  private bot: PewwBot;

  constructor(bot: PewwBot) {
    this.bot = bot;
  }

  get(): Subscription<any>[] {
    return [
      Subscriptions.create('guildMemberAdd')
        .name('guildMemberAdd')
        .handler(async (sub, member) => {
          const guild = await this.bot.getCacheManager().getGuild(member.guild.id);
          if (guild) {
            const setting = guild.settings.find((setting) => setting.key === 'entry');
            if (
              !setting ||
              (setting &&
                (!setting.data ||
                  !(setting.data as any).channelId ||
                  !(setting.data as any).join.mode ||
                  !(setting.data as any).join.message))
            )
              return;
            const channel = member.guild.channels.cache.get((setting.data as any).channelId) as Discord.TextChannel;
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
                    .setThumbnail(member.user.displayAvatarURL())
                    .setTimestamp()
                    .setTitle('Katılım Bilgilendirme');
            channel.send(message);
          }
        }),
      Subscriptions.create('guildMemberRemove')
        .name('guildMemberRemove')
        .handler(async (sub, member) => {
          const guild = await this.bot.getCacheManager().getGuild(member.guild.id);
          if (guild) {
            const setting = guild.settings.find((setting) => setting.key === 'entry');
            if (
              !setting ||
              (setting &&
                (!setting.data ||
                  !(setting.data as any).channelId ||
                  !(setting.data as any).join.mode ||
                  !(setting.data as any).join.message))
            )
              return;
            const channel = member.guild.channels.cache.get((setting.data as any).channelId) as Discord.TextChannel;
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
                    .setThumbnail(member.user.displayAvatarURL())
                    .setTimestamp()
                    .setTitle('Katılım Bilgilendirme');
            channel.send(message);
          }
        }),
      Subscriptions.create('guildCreate')
        .name('guildCreate')
        .handler(async (sub, guild) => {
          const repository = this.bot.getDatabase().getConnection().getRepository(GuildEntity);
          if (!(await repository.findOne({ guildId: guild.id }))) {
            const guildEntity = new GuildEntity();
            guildEntity.guildId = guild.id;
            guildEntity.ownerId = guild.ownerID;
            guildEntity.premium = false;
            guildEntity.customPrefix = [];
            guildEntity.defaultPrefix = true;
            await repository.save(guildEntity);
            return;
          }
        }),
      Subscriptions.create('guildDelete')
        .name('guildDelete')
        .handler(async (sub, guild) => {
          const repository = this.bot.getDatabase().getConnection().getRepository(GuildEntity);
          const guildEntity = await repository.findOne({ guildId: guild.id });
          if (guildEntity) repository.remove(guildEntity);
        }),
    ];
  }
}
