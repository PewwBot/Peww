import { Command } from '../api/command/Command';
import { CommandBatchRegisterer } from '../api/command/CommandBatchRegisterer';
import { CommandCategory } from '../api/command/CommandCategory';
import { Commands } from '../api/command/Commands';
import { Bot } from '../Bot';

export class SettingCommands implements CommandBatchRegisterer {
  get(): Command[] {
    return [SETTING_COMMAND_MAIN];
  }
}

type Setting = 'prefix' | 'joinmessage';
const settings: Setting[] = ['prefix', 'joinmessage'];

const SETTING_COMMAND_MAIN: Command = Commands.create()
  .name('settingMain')
  .description('')
  .aliases(['setting', 'ayar'])
  .category(CommandCategory.SETTING)
  .handler(async (context) => {
    if (context.getArgs().length < 1) {
      context.getMessage().channel.send(context.createEmbedBuilder().setDescription('Komutu eksik girdin!'));
      return;
    }

    if (context.getArgs()[0] === 'help') {
      if (context.getArgs().length < 2) {
        context.getMessage().channel.send(context.createEmbedBuilder().setDescription('Komutu eksik girdin!'));
        return;
      }
      const selectedSetting: Setting = context.getArgs()[1].toLocaleLowerCase('tr-TR') as Setting;
      if (!selectedSetting) {
        context
          .getMessage()
          .channel.send(context.createEmbedBuilder().setDescription(`\`${selectedSetting}\` adında bir ayar yok!`));
        return;
      }
      if (!settings.includes(selectedSetting)) {
        context
          .getMessage()
          .channel.send(context.createEmbedBuilder().setDescription(`\`${selectedSetting}\` adında bir ayar yok!`));
        return;
      }
      Bot.getInstance().getSettingManager().get(selectedSetting).help(context);
    } else {
      if (context.getArgs().length < 2) {
        context.getMessage().channel.send(context.createEmbedBuilder().setDescription('Komutu eksik girdin!'));
        return;
      }
      const selectedSetting: Setting = context.getArgs()[0].toLocaleLowerCase('tr-TR') as Setting;
      if (!selectedSetting) {
        context
          .getMessage()
          .channel.send(context.createEmbedBuilder().setDescription(`\`${selectedSetting}\` adında bir ayar yok!`));
        return;
      }
      if (!settings.includes(selectedSetting)) {
        context
          .getMessage()
          .channel.send(context.createEmbedBuilder().setDescription(`\`${selectedSetting}\` adında bir ayar yok!`));
        return;
      }
      const setting = Bot.getInstance().getSettingManager().get(selectedSetting);
      const settingMode = context.getArgs()[1];
      if (!setting.getModes().includes(settingMode)) {
        context
          .getMessage()
          .channel.send(
            context
              .createEmbedBuilder()
              .setDescription(`\`${selectedSetting}\` adlı ayarın \`${settingMode}\` adında bir ayar modu yok!`)
          );
        return;
      }
      const changeStatus = await setting.change(context.getMessage().guild, setting.getValueOrganizer().organize(context.getArgs().splice(2)), settingMode);
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
  });
