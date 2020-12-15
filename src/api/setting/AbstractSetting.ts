import { MessageEmbed } from 'discord.js';
import { PewwBot } from '../../PewwBot';
import { StringUtil } from '../../utils/StringUtil';
import { CommandContext } from '../command/context/CommandContext';
import { SettingContext } from './context/SettingContext';
import { EmptyOrganizer } from './organizers/EmptyOrganizer';
import { Setting } from './Setting';
import { SettingChangeStatus } from './SettingChangeStatus';
import { SettingMode } from './SettingMode';
import { SettingTypeOrganizer } from './SettingTypeOrganizer';
import { SettingValueOrganizer } from './SettingValueOrganizer';
import { v4 as uuidv4 } from 'uuid';

export abstract class AbstractSetting<T, V> implements Setting<T, V> {
  bot: PewwBot;
  name: string;
  uniqueId: string = uuidv4();
  typeOrganizer: SettingTypeOrganizer<T>;
  valueOrganizer: SettingValueOrganizer<V> = new EmptyOrganizer() as SettingValueOrganizer<any>;
  modes: SettingMode[] = [];

  constructor(args: { name: string }) {
    this.name = args.name;
  }

  public setupOptions(args?: {
    typeOrganizer?: SettingTypeOrganizer<T>;
    valueOrganizer?: SettingValueOrganizer<V>;
    modes?: SettingMode[];
  }) {
    if (args.typeOrganizer) this.typeOrganizer = args.typeOrganizer;
    if (args.valueOrganizer) this.valueOrganizer = args.valueOrganizer;
    if (args.modes) this.modes = args.modes;
  }

  abstract init(): void;

  async call(context: SettingContext<T, V>): Promise<SettingChangeStatus<V>> {
    return this.run(context);
  }

  abstract run(context: SettingContext<T, V>): Promise<SettingChangeStatus<V>>;

  getModes(): SettingMode[] {
    return this.modes;
  }

  getAllModesAliases(): string[] {
    return this.modes.flatMap((mode) => mode.getAliases());
  }

  help(context: CommandContext): void {
    context.getMessage().channel.send(createHelpEmbed(context, this));
  }

  getTypeOrganizer(): SettingTypeOrganizer<T> {
    return this.typeOrganizer;
  }

  getValueOrganizer(): SettingValueOrganizer<V> {
    return this.valueOrganizer;
  }
}

function createHelpEmbed(context: CommandContext, setting: Setting<any, any>): MessageEmbed {
  return context
    .createEmbedBuilder()
    .setDescription(
      `\`${StringUtil.capitalize(
        setting.name,
        'tr-TR'
      )}\` Ayarı hakkında yardım;\n\nKullanım: \`${context.getOrganizedPrefix()}${context.getLabel()} ${
        setting.name
      } <mod> [<değer>]\`\nYapabileceğiniz düzenleme modları:\n${setting.modes
        .map(
          (mode) =>
            `${mode
              .getAliases()
              .map((aliases) => `\`${aliases}\``)
              .join(', ')}${mode.getHelpMessage() ? ' - ' + mode.getHelpMessage() : ''}`
        )
        .join('\n')}`
    )
    .setColor('#b3e324')
    .setAuthor('Peww', context.getMessage().client.user.avatarURL());
}
