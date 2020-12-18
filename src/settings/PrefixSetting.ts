import * as Discord from 'discord.js';
import { SettingChangeStatus } from '../api/setting/SettingChangeStatus';
import { SettingMode } from '../api/setting/SettingMode';
import { AbstractSetting } from '../api/setting/AbstractSetting';
import { SettingContext } from '../api/setting/context/SettingContext';
import { CommandContext } from '../api/command/context/CommandContext';
import { EmptyOrganizer } from '../api/setting/organizers/EmptyOrganizer';
import { PewwGuild } from '../structures/GuildStructure';

export class PrefixSetting extends AbstractSetting<Discord.Guild, string[] | undefined> {
  constructor() {
    super({
      name: 'prefix',
    });
  }

  init(): void {
    this.setupOptions({
      modes: [
        SettingMode.of('GET', ['get', 'control'], 'Bilgilendirme yapar.'),
        SettingMode.of('SET', ['set'], 'Belirleme yapar.'),
        SettingMode.of('ADD', ['add'], 'Ekleme yapar.'),
        SettingMode.of('REMOVE', ['remove'], 'Çıkarma yapar.'),
        SettingMode.of('CLEAR', ['clear'], 'Ayarı varsayılana çevirir.'),
      ],
      typeOrganizer: {
        organize: (context: CommandContext) => {
          return context.getMessage().guild;
        },
      },
      valueOrganizer: new EmptyOrganizer(),
    });
  }

  async run(context: SettingContext<Discord.Guild, string[]>): Promise<SettingChangeStatus<string[]>> {
    const guild: PewwGuild = (await context.getBot().guilds.cache.get(context.getType().id)) as PewwGuild;
    if (!guild) return SettingChangeStatus.of(null, () => 'Sunucu bilgilerine ulaşılamıyor!');
    await guild.load();
    if (context.getMode().getName() === 'GET') {
      return SettingChangeStatus.of(
        guild.getPData().command.customPrefix,
        () =>
          `\`Prefix\` ayarı: ${
            guild.getPData().command.customPrefix.length < 1
              ? '`Yok`'
              : guild
                  .getPData()
                  .command.customPrefix.map((prefix: any) => `\`${prefix}\``)
                  .join(', ')
          } (Ana Prefixler: ${guild.getPData().command.defaultPrefix ? '`Aktif`' : '`Devre Dışı`'})`
      );
    }
    if (context.getMode().getName() === 'DEFAULT_PREFIX') {
      if (context.getValue().length < 1) {
        guild.getPData().command.defaultPrefix = !guild.getPData().command.defaultPrefix;
        try {
          await guild.save();
          return SettingChangeStatus.of(
            [],
            () =>
              `\`Default-Prefix\` ayarı ${guild.getPData().command.defaultPrefix ? '`aktif`' : '`devre dışı`'} edildi!`
          );
        } catch (error) {
          return SettingChangeStatus.of(null, () => 'Ayar değiştirilirken hata oluştu. Lütfen tekrar deneyin!');
        }
      }
      switch (context.getValue()[0]) {
        case 'true':
          guild.getPData().command.defaultPrefix = true;
          try {
            await guild.save();
            return SettingChangeStatus.of([], () => '`Default-Prefix` ayarı `aktif` edildi!');
          } catch (error) {
            return SettingChangeStatus.of(null, () => 'Ayar değiştirilirken hata oluştu. Lütfen tekrar deneyin!');
          }
        case 'false':
          guild.getPData().command.defaultPrefix = false;
          try {
            await guild.save();
            return SettingChangeStatus.of([], () => '`Default-Prefix` ayarı `devre dışı` edildi!');
          } catch (error) {
            return SettingChangeStatus.of(null, () => 'Ayar değiştirilirken hata oluştu. Lütfen tekrar deneyin!');
          }
      }
      return SettingChangeStatus.of(
        null,
        () => '`Default-Prefix` ayarını değiştirebilmek için değer belirtmeniz gerekli! `(true/false)`'
      );
    }
    if (context.getMode().getName() === 'CLEAR') {
      guild.getPData().command.customPrefix = [];
      try {
        await guild.save();
        return SettingChangeStatus.of([], () => '`Prefix` ayarı sıfırlandı!');
      } catch (error) {
        return SettingChangeStatus.of(null, () => 'Ayar değiştirilirken hata oluştu. Lütfen tekrar deneyin!');
      }
    }
    if (context.getValue().length < 1)
      return SettingChangeStatus.of(null, () => '`Prefix` ayarını değiştirebilmek için değer belirtmeniz gerekli!');
    if (context.getValue().some((val) => context.getBot().getConfig().getData().prefix.includes(val))) {
      return SettingChangeStatus.of(
        null,
        () => '`Prefix` ayarı için belirttiğiniz değer ana prefix listesinde olduğu için ayarlanamaz!'
      );
    }
    const data = context.getValue().filter((val) => !(val.length > 3));
    if (data.length < 1)
      return SettingChangeStatus.of(null, () => "`Prefix` ayarı en fazla 3 karakter'den oluşabilir!");
    switch (context.getMode().getName()) {
      case 'SET':
        if (!guild.getPData().premium && data.length > 2)
          return SettingChangeStatus.of(
            null,
            () => "Sunucu `Premium` özelliğine sahip olmadığı için 2 adet'ten fazla özel prefix belirleyemezsin!"
          );
        guild.getPData().command.customPrefix = data;
        try {
          await guild.save();
          return SettingChangeStatus.of(
            data,
            () => `\`Prefix\` ayarı ${data.map((prefix) => `\`${prefix}\``).join(', ')} olarak ayarlandı!`
          );
        } catch (error) {}
        break;
      case 'ADD':
        if (!guild.getPData().premium && data.length > 2)
          return SettingChangeStatus.of(
            null,
            () => "Sunucu `Premium` özelliğine sahip olmadığı için 2 adet'ten fazla özel prefix belirleyemezsin!"
          );
        const changedDataAdd = data.filter((val) => !guild.getPData().command.customPrefix.includes(val));
        if (!guild.getPData().premium && changedDataAdd.length + guild.getPData().command.customPrefix.length > 2)
          return SettingChangeStatus.of(
            null,
            () => "Sunucu `Premium` özelliğine sahip olmadığı için 2 adet'ten fazla özel prefix belirleyemezsin!"
          );
        if (changedDataAdd.length < 1)
          return SettingChangeStatus.of(null, () => 'Belirttiğiniz değere göre ayar değiştirilemedi!');
        guild.getPData().command.customPrefix.push(...changedDataAdd);
        try {
          await guild.save();
          return SettingChangeStatus.of(
            changedDataAdd,
            () => `\`Prefix\` ayarına ${data.map((prefix) => `\`${prefix}\``).join(', ')} eklendi!`
          );
        } catch (error) {}
        break;
      case 'REMOVE':
        const changedDataRemove = data.filter((val) => guild.getPData().command.customPrefix.includes(val));
        if (changedDataRemove.length < 1)
          return SettingChangeStatus.of(null, () => 'Belirttiğiniz değere göre ayar değiştirilemedi!');
        guild.getPData().command.customPrefix = guild
          .getPData()
          .command.customPrefix.filter((val) => !changedDataRemove.includes(val));
        try {
          await guild.save();
          return SettingChangeStatus.of(
            changedDataRemove,
            () => `\`Prefix\` ayarından ${data.map((prefix) => `\`${prefix}\``).join(', ')} çıkarıldı!`
          );
        } catch (error) {}
        break;
    }
    return SettingChangeStatus.of(null, () => 'Ayar değiştirilirken hata oluştu. Lütfen tekrar deneyin!');
  }
}
