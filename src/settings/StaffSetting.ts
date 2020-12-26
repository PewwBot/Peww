import * as Discord from 'discord.js';
import { CommandContext } from '../api/command/context/CommandContext';
import { GuildSettings } from '../api/database/entity/GuildSettingEntity';
import { AbstractSetting } from '../api/setting/AbstractSetting';
import { SettingContext } from '../api/setting/context/SettingContext';
import { EmptyOrganizer } from '../api/setting/organizers/EmptyOrganizer';
import { SettingChangeStatus } from '../api/setting/SettingChangeStatus';
import { SettingMode } from '../api/setting/SettingMode';
import { PewwGuild } from '../structures/GuildStructure';
import { MentionUtil } from '../utils/MentionUtil';

export class StaffSetting extends AbstractSetting<Discord.Guild, string[] | undefined> {
  constructor() {
    super({
      name: 'staff',
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
    let setting = guild.getCustomData().settings.find((setting: { key: string }) => setting.key === 'staffRoles');
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
      if (putNew) guild.getCustomData().settings.push(setting);
      try {
        await guild.save();
        return SettingChangeStatus.of([], () => '`Staff` ayarı sıfırlandı!');
      } catch (error) {
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
        if (putNew) guild.getCustomData().settings.push(setting);
        try {
          await guild.save();
          return SettingChangeStatus.of(
            context.getValue(),
            () => `\`Staff\` ayarı ${rolesSet.map((staff) => `<@&${staff}>`).join(', ')} olarak ayarlandı!`
          );
        } catch (error) {}
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
        if (putNew) guild.getCustomData().settings.push(setting);
        try {
          await guild.save();
          return SettingChangeStatus.of(
            changedDataAdd,
            () => `\`Staff\` ayarına ${changedDataAdd.map((staff) => `<@&${staff}>`).join(', ')} eklendi!`
          );
        } catch (error) {}
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
        if (putNew) guild.getCustomData().settings.push(setting);
        try {
          await guild.save();
          return SettingChangeStatus.of(
            changedDataRemove,
            () => `\`Staff\` ayarından ${changedDataRemove.map((staff) => `<@&${staff}>`).join(', ')} çıkarıldı!`
          );
        } catch (error) {}
        break;
    }
    return SettingChangeStatus.of(null, () => 'Ayar değiştirilirken hata oluştu. Lütfen tekrar deneyin!');
  }
}
