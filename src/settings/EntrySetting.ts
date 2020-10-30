import { GuildSettings } from '../api/database/entity/GuildSettingEntity';
import { SettingRegisterer } from '../api/setting/SettingRegisterer';

import * as Discord from 'discord.js';
import { Setting } from '../api/setting/Setting';
import { Settings } from '../api/setting/Settings';
import { SettingChangeStatus } from '../api/setting/SettingChangeStatus';
import { Bot } from '../Bot';
import { SettingMode } from '../api/setting/SettingMode';
import { EmptyOrganizer } from '../api/setting/organizers/EmptyOrganizer';

export class EntrySetting implements SettingRegisterer<Discord.Guild, string[] | undefined> {
  get(): Setting<Discord.Guild, string[] | undefined> {
    return Settings.create<Discord.Guild, string[] | undefined>('entry')
      .mode(
        SettingMode.of(
          'MODE_MODIFIER',
          ['join:mode:set', 'leave:mode:set'],
          'Mesaj modunu değiştirir. (embed, message, off)'
        )
      )
      .mode(SettingMode.of('MESSAGE_MODIFIER', ['join:message:set', 'leave:message:set'], 'Mesajı değiştirir.'))
      .mode(SettingMode.of('GET', ['get', 'control'], 'Bilgilendirme yapar.'))
      .mode(SettingMode.of('CLEAR', ['clear'], 'Ayarı varsayılana çevirir.'))
      .typeOrganizer((context) => context.getMessage().guild)
      .valueOrganizer(new EmptyOrganizer())
      .handler(async (guild, data, currentModeAliases, mode) => {
        const guildData = await Bot.getInstance().getCacheManager().getGuild(guild.id);
        if (!guildData) return SettingChangeStatus.of(null, () => 'Sunucu bilgilerine ulaşılamıyor!');
        let setting = guildData.settings.find((setting) => setting.key === 'entry');
        if (mode.getName() === 'GET') {
          return SettingChangeStatus.of(
            guildData.getCustomPrefix(),
            () =>
              `\`Entry\` ayarı: ${
                !setting || !setting.data
                  ? '`Yok`'
                  : `\n\nGiriş Mesaj Modu: ${
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
          setting.guildId = guild.id;
          setting.key = 'entry';
          setting.data = { join: { mode: 'off', message: null }, leave: { mode: 'off', message: null } };
          putNew = true;
        }
        switch (mode.getName()) {
          case 'MODE_MODIFIER':
            if (data.length < 1)
              return SettingChangeStatus.of(
                null,
                () => 'Ayarı değiştirmek için belirtmeniz gerekir!\nAyarlayabileceğiniz modlar: embed, message, off'
              );
            if (!['embed', 'message', 'off'].includes(data[0])) {
              return SettingChangeStatus.of(
                null,
                () => 'Mesaj modu hatalı!\nAyarlayabileceğiniz modlar: embed, message, off'
              );
            }
            const entryMode = currentModeAliases.split(':', 2)[0];
            switch (entryMode) {
              case 'join':
                (setting.data as any).join.mode = data[0];
                break;
              case 'leave':
                (setting.data as any).leave.mode = data[0];
                break;
            }
            if (putNew) guildData.settings.push(setting);
            if (await guildData.save()) {
              return SettingChangeStatus.of(
                data,
                () =>
                  `\`Entry-${entryMode.charAt(0).toLocaleUpperCase('tr-TR') + entryMode.slice(1)}-Mode\` ayarı \`${
                    data[0]
                  }\` olarak ayarlandı!`
              );
            }
            break;
          case 'MESSAGE_MODIFIER':
            if (data.length < 1)
              return SettingChangeStatus.of(null, () => 'Ayarı değiştirmek için belirtmeniz gerekir!');
            const entryMessage = currentModeAliases.split(':', 2)[0];
            switch (entryMessage) {
              case 'join':
                (setting.data as any).join.message = data.join(' ');
                break;
              case 'leave':
                (setting.data as any).leave.message = data.join(' ');
                break;
            }
            if (putNew) guildData.settings.push(setting);
            if (await guildData.save()) {
              return SettingChangeStatus.of(
                data,
                () =>
                  `\`Entry-${entryMessage.charAt(0).toLocaleUpperCase('tr-TR') + entryMessage.slice(1)}-Message\` ayarı \`${
                    data.join(' ')
                  }\` olarak ayarlandı!`
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
      });
  }
}
