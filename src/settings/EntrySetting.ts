import * as Discord from 'discord.js';
import { CommandContext } from '../api/command/context/CommandContext';
import { GuildSettings } from '../api/database/entity/GuildSettingEntity';
import { AbstractSetting } from '../api/setting/AbstractSetting';
import { SettingContext } from '../api/setting/context/SettingContext';
import { EmptyOrganizer } from '../api/setting/organizers/EmptyOrganizer';
import { SettingChangeStatus } from '../api/setting/SettingChangeStatus';
import { SettingMode } from '../api/setting/SettingMode';
import { MentionUtil } from '../utils/MentionUtil';
import { StringUtil } from '../utils/StringUtil';

export class EntrySetting extends AbstractSetting<
  { guild: Discord.Guild; channel: Discord.TextChannel },
  string[] | undefined
> {
  constructor() {
    super({
      name: 'entry',
      modes: [
        SettingMode.of(
          'MODE_MODIFIER',
          ['join mode set', 'leave mode set'],
          'Mesaj modunu değiştirir. (embed, message, off)'
        ),
        SettingMode.of('MESSAGE_MODIFIER', ['join message set', 'leave message set'], 'Mesajı değiştirir.'),
        SettingMode.of('CHANNEL', ['channel set'], 'Mesajların oluşturalacağı odayı belirler.'),
        SettingMode.of('GET', ['get', 'control'], 'Bilgilendirme yapar.'),
        SettingMode.of('CLEAR', ['clear'], 'Ayarı varsayılana çevirir.'),
      ],
      typeOrganizer: {
        organize: (context: CommandContext) => {
          return {
            guild: context.getMessage().guild,
            channel: context.getMessage().channel as Discord.TextChannel,
          };
        },
      },
      valueOrganizer: new EmptyOrganizer(),
    });
  }

  async run(
    context: SettingContext<{ guild: Discord.Guild; channel: Discord.TextChannel }, string[]>
  ): Promise<SettingChangeStatus<string[]>> {
    const guildData = await context.getBot().getCacheManager().getGuild(context.getType().guild.id, true);
    if (!guildData) return SettingChangeStatus.of(null, () => 'Sunucu bilgilerine ulaşılamıyor!');
    let setting = guildData.settings.find((setting) => setting.key === 'entry');
    if (context.getMode().getName() === 'GET') {
      return SettingChangeStatus.of<any>(
        !setting || !setting.data ? {} : setting.data,
        () =>
          `\`Entry\` ayarı: ${
            !setting || !setting.data
              ? '`Yok`'
              : `\n\nMesaj Kanalı: ${
                  !(setting.data as any).channelId ? '`Yok`' : `<#${(setting.data as any).channelId}>`
                }\nGiriş Mesaj Modu: ${
                  !(setting.data as any).join.mode ? '`off`' : `\`${(setting.data as any).join.mode}\``
                }\nGiriş Mesajı: ${
                  !(setting.data as any).join.message ? '`Yok`' : `\`${(setting.data as any).join.message}\``
                }\nÇıkış Mesaj Modu: ${
                  !(setting.data as any).leave.mode ? '`off`' : `\`${(setting.data as any).leave.mode}\``
                }\nÇıkış Mesajı: ${
                  !(setting.data as any).leave.message ? '`Yok`' : `\`${(setting.data as any).leave.message}\``
                }`
          }`
      );
    }
    let putNew = false;
    if (!setting) {
      setting = new GuildSettings();
      setting.guildId = context.getType().guild.id;
      setting.key = 'entry';
      setting.data = { join: { mode: 'off', message: null }, leave: { mode: 'off', message: null }, channelId: '' };
      putNew = true;
    }
    switch (context.getMode().getName()) {
      case 'CHANNEL':
        if (context.getValue().length < 1) {
          (setting.data as any).channelId = context.getType().channel.id;
          if (putNew) guildData.settings.push(setting);
          if (await guildData.save()) {
            return SettingChangeStatus.of<any>(
              context.getType().channel,
              () => `<#${context.getType().channel.id}> odası giriş-çıkış bildirim odası olarak belirlendi!`
            );
          }
        } else {
          const channel = MentionUtil.getChannelFromMention(context.getType().guild, context.getValue()[0]);
          if (!channel) {
            return SettingChangeStatus.of(null, () => 'Ayarı değiştirmek için yazı kanalı etiketlemeniz gerekir!');
          }
          (setting.data as any).channelId = channel.id;
          if (putNew) guildData.settings.push(setting);
          if (await guildData.save()) {
            return SettingChangeStatus.of<any>(
              channel,
              () => `<#${channel.id}> odası giriş-çıkış bildirim odası olarak belirlendi!`
            );
          }
        }
        break;
      case 'MODE_MODIFIER':
        if (context.getValue().length < 1)
          return SettingChangeStatus.of(
            null,
            () => 'Ayarı değiştirmek için belirtmeniz gerekir!\nAyarlayabileceğiniz modlar: embed, message, off'
          );
        if (!['embed', 'message', 'off'].includes(context.getValue()[0])) {
          return SettingChangeStatus.of(
            null,
            () => 'Mesaj modu hatalı!\nAyarlayabileceğiniz modlar: embed, message, off'
          );
        }
        const entryMode = context.getCurrentModeArgs()[0];
        switch (entryMode) {
          case 'join':
            (setting.data as any).join.mode = context.getValue()[0];
            break;
          case 'leave':
            (setting.data as any).leave.mode = context.getValue()[0];
            break;
        }
        if (putNew) guildData.settings.push(setting);
        if (await guildData.save()) {
          return SettingChangeStatus.of(
            context.getValue(),
            () =>
              `\`Entry-${StringUtil.capitalize(entryMode, 'tr-TR')}-Mode\` ayarı \`${
                context.getValue()[0]
              }\` olarak ayarlandı!`
          );
        }
        break;
      case 'MESSAGE_MODIFIER':
        if (context.getValue().length < 1)
          return SettingChangeStatus.of(null, () => 'Ayarı değiştirmek için belirtmeniz gerekir!');
        const entryMessage = context.getCurrentModeArgs()[0];
        switch (entryMessage) {
          case 'join':
            (setting.data as any).join.message = context.getValue().join(' ');
            break;
          case 'leave':
            (setting.data as any).leave.message = context.getValue().join(' ');
            break;
        }
        if (putNew) guildData.settings.push(setting);
        if (await guildData.save()) {
          return SettingChangeStatus.of(
            context.getValue(),
            () =>
              `\`Entry-${StringUtil.capitalize(entryMessage, 'tr-TR')}-Message\` ayarı \`${context
                .getValue()
                .join(' ')}\` olarak ayarlandı!`
          );
        }
        break;
      case 'CLEAR':
        setting.data = { join: { mode: 'off', message: null }, leave: { mode: 'off', message: null } };
        if (putNew) guildData.settings.push(setting);
        if (await guildData.save()) {
          return SettingChangeStatus.of([], () => '`Entry` ayarı sıfırlandı!');
        }
        break;
    }
    return SettingChangeStatus.of(null, () => 'Ayar değiştirilirken hata oluştu. Lütfen tekrar deneyin!');
  }
}
