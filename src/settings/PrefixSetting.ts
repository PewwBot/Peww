import { SettingRegisterer } from '../api/setting/SettingRegisterer';

import * as Discord from 'discord.js';
import { Setting } from '../api/setting/Setting';
import { Settings } from '../api/setting/Settings';
import { SettingChangeStatus } from '../api/setting/SettingChangeStatus';
import { Bot } from '../Bot';

export class PrefixSetting implements SettingRegisterer<Discord.Guild, string[] | undefined> {
  get(): Setting<Discord.Guild, string[] | undefined> {
    return Settings.create<Discord.Guild, string[] | undefined>('prefix')
      .modes('get', 'set', 'add', 'remove', 'clear')
      .typeOrganizer((context) => {
        return context.getMessage().guild;
      })
      .getHandler(async (guild) => {
        const guildData = await Bot.getInstance().getCacheManager().getGuild(guild.id);
        if (!guildData) return null;
        return guildData.getCustomPrefix();
      })
      .changeHandler(async (guild, data, mode) => {
        const guildData = await Bot.getInstance().getCacheManager().getGuild(guild.id);
        if (!guildData) return SettingChangeStatus.of(null, () => 'Sunucu bilgilerine ulaşılamıyor!');
        if (mode === 'get') {
          return SettingChangeStatus.of(
            guildData.getCustomPrefix(),
            () =>
              `\`Prefix\` ayarı: ${
                guildData.getCustomPrefix().length < 1
                  ? '`Yok`'
                  : guildData
                      .getCustomPrefix()
                      .map((prefix) => `\`${prefix}\``)
                      .join(', ')
              }`
          );
        }
        if (mode === 'clear') {
          guildData.customPrefix = [];
          if (await guildData.save()) {
            return SettingChangeStatus.of([], () => '`Prefix` ayarı sıfırlandı!');
          }
        }
        if (data.length < 1)
          return SettingChangeStatus.of(null, () => '`Prefix` ayarını değiştirebilmek için değer belirtmeniz gerekli!');
        if (data.some((val) => Bot.getInstance().getConfig().getData().prefix.includes(val))) {
          return SettingChangeStatus.of(
            null,
            () =>
              '`Prefix` ayarı için belirttiğiniz değer ana prefix listesinde olduğu için ayarlanamaz!'
          );
        }
        data = data.filter((val) => !(val.length > 2));
        if (data.length < 1) return SettingChangeStatus.of(null, () => '`Prefix` ayarı en fazla 2 karakter\'den oluşabilir!');
        if (mode === 'set') {
          guildData.customPrefix = data;
          if (await guildData.save()) {
            return SettingChangeStatus.of(
              data,
              () => `\`Prefix\` ayarı ${data.map((prefix) => `\`${prefix}\``).join(', ')} olarak ayarlandı!`
            );
          }
        } else if (mode === 'add') {
          const changedData = data.filter((val) => !guildData.customPrefix.includes(val));
          if (changedData.length < 1)
            return SettingChangeStatus.of(null, () => 'Belirttiğiniz değere göre ayar değiştirilemedi!');
          guildData.customPrefix.push(...changedData);
          if (await guildData.save()) {
            return SettingChangeStatus.of(
              changedData,
              () => `\`Prefix\` ayarına ${data.map((prefix) => `\`${prefix}\``).join(', ')} eklendi!`
            );
          }
        } else if (mode === 'remove') {
          const changedData = data.filter((val) => guildData.customPrefix.includes(val));
          if (changedData.length < 1)
            return SettingChangeStatus.of(null, () => 'Belirttiğiniz değere göre ayar değiştirilemedi!');
          guildData.customPrefix = guildData.customPrefix.filter((val) => !changedData.includes(val));
          if (await guildData.save()) {
            return SettingChangeStatus.of(
              changedData,
              () => `\`Prefix\` ayarından ${data.map((prefix) => `\`${prefix}\``).join(', ')} çıkarıldı!`
            );
          }
        }
        return SettingChangeStatus.of(null, () => 'Ayar değiştirilirken hata oluştu. Lütfen tekrar deneyin!');
      });
  }
}
