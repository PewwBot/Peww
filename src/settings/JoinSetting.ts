import { GuildSettings } from './../api/database/entity/GuildSettingEntity';
import { SettingRegisterer } from '../api/setting/SettingRegisterer';

import * as Discord from 'discord.js';
import { Setting } from '../api/setting/Setting';
import { Settings } from '../api/setting/Settings';
import { SettingChangeStatus } from '../api/setting/SettingChangeStatus';
import { Bot } from '../Bot';
import { StringOrganizer } from '../api/setting/organizers/StringOrganizer';

export class JoinSetting implements SettingRegisterer<Discord.Guild, string | undefined> {
  get(): Setting<Discord.Guild, string | undefined> {
    return Settings.create<Discord.Guild, string | undefined>('joinmessage')
      .modes('get', 'set', 'clear')
      .typeOrganizer((context) => {
        return context.getMessage().guild;
      })
      .valueOrganizer(new StringOrganizer())
      .getHandler(async (guild) => {
        const guildData = await Bot.getInstance().getCacheManager().getGuild(guild.id);
        if (!guildData) return null;
        const setting = guildData.settings.find((setting) => setting.key === 'joinMessage');
        if (!setting) return null;
        return setting.data.value;
      })
      .changeHandler(async (guild, data, mode) => {
        const guildData = await Bot.getInstance().getCacheManager().getGuild(guild.id);
        if (!guildData) return SettingChangeStatus.of(null, () => 'Sunucu bilgilerine ulaşılamıyor!');
        let setting = guildData.settings.find((setting) => setting.key === 'joinMessage');
        if (mode === 'get') {
          return SettingChangeStatus.of(
            guildData.getCustomPrefix(),
            () => `\`JoinMessage\` ayarı: \`${!setting || !setting.data.value ? 'Yok' : setting.data.value}\``
          );
        }
        let putNew = false;
        if (!setting) {
          setting = new GuildSettings();
          setting.guildId = guild.id;
          setting.key = 'joinMessage';
          setting.data = { value: '' };
          putNew = true;
        }
        if (mode === 'clear') {
          setting.data.value = null;
          if (putNew) guildData.settings.push(setting);
          if (await guildData.save()) {
            return SettingChangeStatus.of([], () => '`JoinMessage` ayarı sıfırlandı!');
          }
        }
        if (data.length < 1)
          return SettingChangeStatus.of(
            null,
            () => '`JoinMessage` ayarını değiştirebilmek için değer belirtmeniz gerekli!'
          );
        if (mode === 'set') {
          setting.data.value = data;
          if (putNew) guildData.settings.push(setting);
          if (await guildData.save()) {
            return SettingChangeStatus.of(data, () => `\`JoinMessage\` ayarı \`${data}\` olarak ayarlandı!`);
          }
        }
        return SettingChangeStatus.of(null, () => 'Ayar değiştirilirken hata oluştu. Lütfen tekrar deneyin!');
      });
  }
}
