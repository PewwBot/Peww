import { SettingRegisterer } from '../api/setting/SettingRegisterer';

import * as Discord from 'discord.js';
import { Setting } from '../api/setting/Setting';
import { Settings } from '../api/setting/Settings';
import { SettingChangeStatus } from '../api/setting/SettingChangeStatus';
import { Bot } from '../Bot';
import { SettingMode } from '../api/setting/SettingMode';

export class PrefixSetting implements SettingRegisterer<Discord.Guild, string[] | undefined> {
  get(): Setting<Discord.Guild, string[] | undefined> {
    return Settings.create<Discord.Guild, string[] | undefined>('prefix')
      .mode(SettingMode.of('GET', ['get', 'control'], 'Bilgilendirme yapar.'))
      .mode(SettingMode.of('SET', ['set'], 'Belirleme yapar.'))
      .mode(SettingMode.of('ADD', ['add'], 'Ekleme yapar.'))
      .mode(SettingMode.of('REMOVE', ['remove'], 'Çıkarma yapar.'))
      .mode(SettingMode.of('CLEAR', ['clear'], 'Ayarı varsayılana çevirir.'))
      .mode(SettingMode.of('DEFAULT_PREFIX', ['default_prefix'], 'Botun kendi prefixlerinin kullanıp kullanılmayacağını ayarlar. (Sadece özel prefix belirliyse çalışır)'))
      .typeOrganizer((context) => {
        return context.getMessage().guild;
      })
      .handler(async (guild, data, mode, currentModeArgs) => {
        const guildData = await Bot.getInstance().getCacheManager().getGuild(guild.id);
        if (!guildData) return SettingChangeStatus.of(null, () => 'Sunucu bilgilerine ulaşılamıyor!');
        if (mode.getName() === 'GET') {
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
              } (Ana Prefixler: ${guildData.defaultPrefix ? '`Aktif`' : '`Devre Dışı`'})`
          );
        }
        if (mode.getName() === 'DEFAULT_PREFIX') {
          if (data.length < 1) {
            guildData.defaultPrefix = !guildData.defaultPrefix;
            if (await guildData.save()) {
              return SettingChangeStatus.of([], () => `\`Default-Prefix\` ayarı ${guildData.defaultPrefix ? '`aktif`' : '`devre dışı`'} edildi!`);
            } else {
              return SettingChangeStatus.of(null, () => 'Ayar değiştirilirken hata oluştu. Lütfen tekrar deneyin!');
            }
          }
          switch (data[0]) {
            case 'true':
              guildData.defaultPrefix = true;
              if (await guildData.save()) {
                return SettingChangeStatus.of([], () => '`Default-Prefix` ayarı `aktif` edildi!');
              } else {
                return SettingChangeStatus.of(null, () => 'Ayar değiştirilirken hata oluştu. Lütfen tekrar deneyin!');
              }
            case 'false':
              guildData.defaultPrefix = false;
              if (await guildData.save()) {
                return SettingChangeStatus.of([], () => '`Default-Prefix` ayarı `devre dışı` edildi!');
              } else {
                return SettingChangeStatus.of(null, () => 'Ayar değiştirilirken hata oluştu. Lütfen tekrar deneyin!');
              }
          }
          return SettingChangeStatus.of(null, () => '`Default-Prefix` ayarını değiştirebilmek için değer belirtmeniz gerekli! `(true/false)`');
        }
        if (mode.getName() === 'CLEAR') {
          guildData.customPrefix = [];
          if (await guildData.save()) {
            return SettingChangeStatus.of([], () => '`Prefix` ayarı sıfırlandı!');
          } else {
            return SettingChangeStatus.of(null, () => 'Ayar değiştirilirken hata oluştu. Lütfen tekrar deneyin!');
          }
        }
        if (data.length < 1)
          return SettingChangeStatus.of(null, () => '`Prefix` ayarını değiştirebilmek için değer belirtmeniz gerekli!');
        if (data.some((val) => Bot.getInstance().getConfig().getData().prefix.includes(val))) {
          return SettingChangeStatus.of(
            null,
            () => '`Prefix` ayarı için belirttiğiniz değer ana prefix listesinde olduğu için ayarlanamaz!'
          );
        }
        data = data.filter((val) => !(val.length > 3));
        if (data.length < 1)
          return SettingChangeStatus.of(null, () => "`Prefix` ayarı en fazla 3 karakter'den oluşabilir!");
        switch (mode.getName()) {
          case 'SET':
            if (!guildData.isPremium() && data.length > 2)
              return SettingChangeStatus.of(
                null,
                () => "Sunucu `Premium` özelliğine sahip olmadığı için 2 adet'ten fazla özel prefix belirleyemezsin!"
              );
            guildData.customPrefix = data;
            if (await guildData.save()) {
              return SettingChangeStatus.of(
                data,
                () => `\`Prefix\` ayarı ${data.map((prefix) => `\`${prefix}\``).join(', ')} olarak ayarlandı!`
              );
            }
            break;
          case 'ADD':
            if (!guildData.isPremium() && data.length > 2)
              return SettingChangeStatus.of(
                null,
                () => "Sunucu `Premium` özelliğine sahip olmadığı için 2 adet'ten fazla özel prefix belirleyemezsin!"
              );
            const changedDataAdd = data.filter((val) => !guildData.customPrefix.includes(val));
            if (!guildData.isPremium() && changedDataAdd.length + guildData.getCustomPrefix().length > 2)
              return SettingChangeStatus.of(
                null,
                () => "Sunucu `Premium` özelliğine sahip olmadığı için 2 adet'ten fazla özel prefix belirleyemezsin!"
              );
            if (changedDataAdd.length < 1)
              return SettingChangeStatus.of(null, () => 'Belirttiğiniz değere göre ayar değiştirilemedi!');
            guildData.customPrefix.push(...changedDataAdd);
            if (await guildData.save()) {
              return SettingChangeStatus.of(
                changedDataAdd,
                () => `\`Prefix\` ayarına ${data.map((prefix) => `\`${prefix}\``).join(', ')} eklendi!`
              );
            }
            break;
          case 'REMOVE':
            const changedDataRemove = data.filter((val) => guildData.customPrefix.includes(val));
            if (changedDataRemove.length < 1)
              return SettingChangeStatus.of(null, () => 'Belirttiğiniz değere göre ayar değiştirilemedi!');
            guildData.customPrefix = guildData.customPrefix.filter((val) => !changedDataRemove.includes(val));
            if (await guildData.save()) {
              return SettingChangeStatus.of(
                changedDataRemove,
                () => `\`Prefix\` ayarından ${data.map((prefix) => `\`${prefix}\``).join(', ')} çıkarıldı!`
              );
            }
            break;
        }
        return SettingChangeStatus.of(null, () => 'Ayar değiştirilirken hata oluştu. Lütfen tekrar deneyin!');
      });
  }
}
