/*import { Command } from '../api/command/Command';
import { CommandBatchRegisterer } from '../api/command/CommandBatchRegisterer';
import { CommandCategory } from '../api/command/CommandCategory';
import { CommandPermissions } from '../api/command/CommandPermission';
import { Commands } from '../api/command/Commands';
import { EmbedBuilder } from '../api/embed/EmbedBuilder';
import { ImmutableSettingContext } from '../api/setting/context/ImmutableSettingContext';
import { PewwBot } from '../PewwBot';
import { StringUtil } from '../utils/StringUtil';

export class SettingCommands implements CommandBatchRegisterer {
  get(): Command[] {
    return [SETTING_COMMAND_MAIN];
  }
}

const SETTING_COMMAND_MAIN: Command = Commands.create()
  .name('settingMain')
  .description('')
  .aliases(['setting', 'ayar'])
  .category(CommandCategory.SETTING)
  .permission(CommandPermissions.STAFF)
  .handler(async (context) => {
    if (context.getArgs().length < 1) {
      const embedBuilder = context
        .createEmbedBuilder()
        .setColor('#b3e324')
        .setAuthor('Peww', context.getMessage().client.user.avatarURL());
      embedBuilder.setDescription(
        `Aşşağıda bulunan ayarları \`${context.getOrganizedPrefix()}${context.getLabel()} <ayar>\` şeklinde ayarlayabilirsin!`
      );
      embedBuilder.addField(
        'Ayarlar',
        [...context.getBot().getSettingManager().getData().keys()]
          .map((setting) => `\`${StringUtil.capitalize(setting, 'tr-TR')}\``)
          .join(', '),
        true
      );
      context.getMessage().react('✅');
      context.getMessage().channel.send(embedBuilder);
      return;
    }

    if (context.getArgs()[0] === 'help') {
      if (context.getArgs().length < 2) {
        context.getMessage().react('❌');
        context
          .getMessage()
          .channel.send(context.createEmbedBuilder().setDescription('Yardımını almak istediğin ayarı belirtmelisin!'));
        return;
      }
      const selectedSetting: string = context.getArgs()[1].toLocaleLowerCase('tr-TR');
      if (!selectedSetting) {
        context.getMessage().react('❌');
        context
          .getMessage()
          .channel.send(context.createEmbedBuilder().setDescription(`\`${selectedSetting}\` adında bir ayar yok!`));
        return;
      }
      if (![...context.getBot().getSettingManager().getData().keys()].includes(selectedSetting)) {
        context.getMessage().react('❌');
        context
          .getMessage()
          .channel.send(context.createEmbedBuilder().setDescription(`\`${selectedSetting}\` adında bir ayar yok!`));
        return;
      }
      context.getBot().getSettingManager().get(selectedSetting).help(context);
    } else {
      const selectedSetting: string = context.getArgs()[0].toLocaleLowerCase('tr-TR');
      if (!selectedSetting) {
        context.getMessage().react('❌');
        context
          .getMessage()
          .channel.send(context.createEmbedBuilder().setDescription(`\`${selectedSetting}\` adında bir ayar yok!`));
        return;
      }
      if (![...context.getBot().getSettingManager().getData().keys()].includes(selectedSetting)) {
        context.getMessage().react('❌');
        context
          .getMessage()
          .channel.send(context.createEmbedBuilder().setDescription(`\`${selectedSetting}\` adında bir ayar yok!`));
        return;
      }
      const setting = context.getBot().getSettingManager().get(selectedSetting);

      if (context.getArgs().length < 2) {
        context.getMessage().react('✅');
        setting.help(context);
        return;
      }

      if (context.getArgs()[1] === 'help') {
        context.getMessage().react('✅');
        setting.help(context);
        return;
      }

      const settingModeValue: string[] = [];
      let settingMode;
      for (const modeControlArg of Object.assign([], context.getArgs()).splice(1)) {
        settingMode = setting
          .getModes()
          .find(
            (mode: { getAliases: () => string | any[] }) =>
              mode
                .getAliases()
                .includes(
                  settingModeValue.length < 1 ? modeControlArg : settingModeValue.join(' ') + ' ' + modeControlArg
                ),
            null
          );
        settingModeValue.push(modeControlArg);
        if (settingMode) break;
      }
      if (!settingMode) {
        context.getMessage().react('❌');
        context
          .getMessage()
          .channel.send(
            context
              .createEmbedBuilder()
              .setDescription(
                `\`${selectedSetting}\` adlı ayarın \`${settingModeValue.join(' ')}\` adında bir ayar modu yok!`
              )
          );
        return;
      }
      const changeStatus = await setting.handle(
        new ImmutableSettingContext(
          context.getBot(),
          setting.typeOrganizer(context),
          setting.valueOrganizer.organize(context.getArgs().splice(settingModeValue.length + 1)),
          settingMode,
          settingModeValue
        )
      );
      if (changeStatus.isSuccessfully()) {
        context.getMessage().react('✅');
        if (changeStatus.getMessage()) {
          context
            .getMessage()
            .channel.send(
              context
                .createEmbedBuilder()
                .setDescription(changeStatus.getMessage())
                .setColor('#b3e324')
                .setAuthor('Peww', context.getMessage().client.user.avatarURL())
            );
        }
      } else {
        context.getMessage().react('❌');
        if (changeStatus.getMessage()) {
          context
            .getMessage()
            .channel.send(
              context
                .createEmbedBuilder()
                .setDescription(changeStatus.getMessage())
                .setColor('#e33030')
                .setAuthor('Peww', context.getMessage().client.user.avatarURL())
            );
        }
      }
    }
  });*/