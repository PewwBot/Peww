import { Setting } from '../api/setting/Setting';
import * as Discord from 'discord.js';

import { Settings } from '../api/setting/Settings';
import { SettingChangeStatus } from '../api/setting/SettingChangeStatus';
import { SettingMode } from '../api/setting/SettingMode';
import { PewwBot } from '../PewwBot';
import { SettingRegisterer } from '../api/setting/SettingRegisterer';
import { GuildSettings } from '../api/database/entity/GuildSettingEntity';
import { MentionUtil } from '../utils/MentionUtil';

export class StaffSetting implements SettingRegisterer<Discord.Guild, string[] | undefined> {
  get(): Setting<Discord.Guild, string[] | undefined> {
    return Settings.create<Discord.Guild, string[] | undefined>('staff')
      .mode(SettingMode.of('GET', ['get', 'control'], 'Bilgilendirme yapar.'))
      .mode(SettingMode.of('SET', ['set'], 'Belirleme yapar.'))
      .mode(SettingMode.of('ADD', ['add'], 'Ekleme yapar.'))
      .mode(SettingMode.of('REMOVE', ['remove'], 'Çıkarma yapar.'))
      .mode(SettingMode.of('CLEAR', ['clear'], 'Ayarı varsayılana çevirir.'))
      .typeOrganizer((context) => {
        return context.getMessage().guild;
      })
      .handler(async (context) => {
        const guildData = await context.getBot().getCacheManager().getGuild(context.getType().id, true);
        if (!guildData) return SettingChangeStatus.of(null, () => 'Sunucu bilgilerine ulaşılamıyor!');
        let setting = guildData.settings.find((setting: { key: string }) => setting.key === 'staffRoles');
        if (context.getMode().getName() === 'GET') {
          return SettingChangeStatus.of(
            !setting || !setting.data ? {} : setting.data,
            () =>
              `\`Staff\` ayarı: ${
                !setting ||
                !setting.data ||
                !(setting.data as any).value ||
                ((setting.data as any).value as string[]).length < 1
                  ? '`Yok`'
                  : ((setting.data as any).value as string[]).map((staff) => `<@&${staff}>`).join(', ')
              }`
          );
        }
        let putNew = false;
        if (!setting) {
          setting = new GuildSettings();
          setting.guildId = context.getType().id;
          setting.key = 'staffRoles';
          setting.data = { value: [] };
          putNew = true;
        }
        if (context.getMode().getName() === 'CLEAR') {
          (setting.data as any) = null;
          if (putNew) guildData.settings.push(setting);
          if (await guildData.save()) {
            return SettingChangeStatus.of([], () => '`Staff` ayarı sıfırlandı!');
          } else {
            return SettingChangeStatus.of(null, () => 'Ayar değiştirilirken hata oluştu. Lütfen tekrar deneyin!');
          }
        }
        if (context.getValue().length < 1)
          return SettingChangeStatus.of(null, () => '`Staff` ayarını değiştirebilmek için değer belirtmeniz gerekli!');
        switch (context.getMode().getName()) {
          case 'SET':
            const rolesSet: string[] = [];
            for (const roleId of context.getValue()) {
              const role = MentionUtil.getRoleFromMention(context.getType(), roleId);
              if (!role) continue;
              rolesSet.push(role.id);
            }
            if (rolesSet.length < 1)
              return SettingChangeStatus.of(
                null,
                () => '`Staff` ayarını değiştirebilmek için değer belirtmeniz gerekli!'
              );
            if (!setting.data) {
              setting.data = { value: [] };
            }
            ((setting.data as any).value as string[]) = rolesSet;
            if (putNew) guildData.settings.push(setting);
            if (await guildData.save()) {
              return SettingChangeStatus.of(
                context.getValue(),
                () => `\`Staff\` ayarı ${rolesSet.map((staff) => `<@&${staff}>`).join(', ')} olarak ayarlandı!`
              );
            }
            break;
          case 'ADD':
            const rolesAdd: string[] = [];
            for (const roleId of context.getValue()) {
              const role = MentionUtil.getRoleFromMention(context.getType(), roleId);
              if (!role) continue;
              rolesAdd.push(role.id);
            }
            if (rolesAdd.length < 1)
              return SettingChangeStatus.of(
                null,
                () => '`Staff` ayarını değiştirebilmek için değer belirtmeniz gerekli!'
              );
            if (!setting.data) {
              setting.data = { value: [] };
            }
            const changedDataAdd = rolesAdd.filter((val) => !((setting.data as any).value as string[]).includes(val));
            if (changedDataAdd.length < 1)
              return SettingChangeStatus.of(null, () => 'Belirttiğiniz değere göre ayar değiştirilemedi!');
            ((setting.data as any).value as string[]).push(...changedDataAdd);
            if (putNew) guildData.settings.push(setting);
            if (await guildData.save()) {
              return SettingChangeStatus.of(
                changedDataAdd,
                () => `\`Staff\` ayarına ${changedDataAdd.map((staff) => `<@&${staff}>`).join(', ')} eklendi!`
              );
            }
            break;
          case 'REMOVE':
            const rolesRemove: string[] = [];
            for (const roleId of context.getValue()) {
              const role = MentionUtil.getRoleFromMention(context.getType(), roleId);
              if (!role) continue;
              rolesRemove.push(role.id);
            }
            if (rolesRemove.length < 1)
              return SettingChangeStatus.of(
                null,
                () => '`Staff` ayarını değiştirebilmek için değer belirtmeniz gerekli!'
              );
            const changedDataRemove = rolesRemove.filter((val) =>
              ((setting.data as any).value as string[]).includes(val)
            );
            if (changedDataRemove.length < 1)
              return SettingChangeStatus.of(null, () => 'Belirttiğiniz değere göre ayar değiştirilemedi!');
            if (!setting.data) {
              setting.data = { value: [] };
            }
            ((setting.data as any).value as string[]) = ((setting.data as any).value as string[]).filter(
              (val) => !changedDataRemove.includes(val)
            );
            if (putNew) guildData.settings.push(setting);
            if (await guildData.save()) {
              return SettingChangeStatus.of(
                changedDataRemove,
                () => `\`Staff\` ayarından ${changedDataRemove.map((staff) => `<@&${staff}>`).join(', ')} çıkarıldı!`
              );
            }
            break;
        }
        return SettingChangeStatus.of(null, () => 'Ayar değiştirilirken hata oluştu. Lütfen tekrar deneyin!');
      });
  }
}
