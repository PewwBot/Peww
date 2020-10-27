import { Command } from '../api/command/Command';
import { CommandBatchRegisterer } from '../api/command/CommandBatchRegisterer';
import { CommandCategory } from '../api/command/CommandCategory';
import { Commands } from '../api/command/Commands';

export class SettingCommands implements CommandBatchRegisterer {
  get(): Command[] {
    return [SETTING_COMMAND_MAIN];
  }
}

type Setting = 'prefix';

const settings: Setting[] = ['prefix'] 

const SETTING_COMMAND_MAIN: Command = Commands.create()
  .name('settingMain')
  .description('')
  .aliases(['setting', 'ayar'])
  .category(CommandCategory.SETTING)
  .handler((context) => {
    if (context.getArgs().length < 1) {
      context.getMessage().channel.send(context.createEmbedBuilder().setDescription('Komutu eksik girdin!'));
      return;
    }

    if (context.getArgs()[0] === 'help') {
      if (context.getArgs().length < 2) {
        context.getMessage().channel.send(context.createEmbedBuilder().setDescription('Komutu eksik girdin!'));
        return;
      }
    } else {

    }
  });
