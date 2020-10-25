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

const SETTING_COMMAND_MAIN: Command = Commands.create()
  .name('settingMain')
  .description('')
  .aliases(['setting', 'ayar'])
  .category(CommandCategory.SETTING)
  .handler((context) => {
    
  });
