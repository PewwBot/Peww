import * as Discord from 'discord.js';
import { SettingChangeStatus } from '../api/setting/SettingChangeStatus';
import { SettingMode } from '../api/setting/SettingMode';
import { GuildSettings } from '../api/database/entity/GuildSettingEntity';
import { MentionUtil } from '../utils/MentionUtil';
import { AbstractSetting } from '../api/setting/AbstractSetting';
import { SettingContext } from '../api/setting/context/SettingContext';
import { CommandContext } from '../api/command/context/CommandContext';
import { EmptyOrganizer } from '../api/setting/organizers/EmptyOrganizer';

export class StaffSetting extends AbstractSetting<Discord.Guild, string[] | undefined> {
  constructor() {
    super({
      name: 'staff',
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
    const guildData = await context.getBot().getCacheManager().getGuild(context.getType().id, true);
    if (!guildData) return SettingChangeStatus.of(null, () => 'Sunucu bilgilerine ulaşılamıyor!');
    let setting = guildData.settings.find((setting: { key: string }) => setting.key === 'staffRoles');
    if (context.getMode().getName() === 'GET') {
      return SettingChangeStatus.of<any>(
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
          return SettingChangeStatus.of(null, () => '`Staff` ayarını değiştirebilmek için değer belirtmeniz gerekli!');
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
          return SettingChangeStatus.of(null, () => '`Staff` ayarını değiştirebilmek için değer belirtmeniz gerekli!');
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
          return SettingChangeStatus.of(null, () => '`Staff` ayarını değiştirebilmek için değer belirtmeniz gerekli!');
        const changedDataRemove = rolesRemove.filter((val) => ((setting.data as any).value as string[]).includes(val));
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
  }
}
