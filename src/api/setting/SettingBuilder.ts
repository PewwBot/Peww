import { CommandContext } from './../command/context/CommandContext';
import { SettingChangeStatus } from './SettingChangeStatus';
import { Setting } from './Setting';
import { MessageEmbed } from 'discord.js';
import { SettingValueOrganizer } from './SettingValueOrganizer';
import { EmptyOrganizer } from './organizers/EmptyOrganizer';
import { SettingMode } from './SettingMode';
import { StringUtil } from '../../utils/StringUtil';

export class SettingBuilder<T, V> {
  private data: {
    name?: string;
    typeOrganizer?: (context: CommandContext) => any;
    valueOrganizer: SettingValueOrganizer<any>;
    modes: SettingMode[];
    help?: (context: CommandContext) => void;
    // get?: (t: T) => Promise<V>;
  } = { valueOrganizer: new EmptyOrganizer(), modes: [] };

  constructor(name: string) {
    this.data.name = name;
  }

  public static newBuilder<T, V>(name: string): SettingBuilder<T, V> {
    return new SettingBuilder(name);
  }

  public name(name: string): SettingBuilder<T, V> {
    this.data.name = name;
    return this;
  }

  public typeOrganizer(organizer: (context: CommandContext) => any): SettingBuilder<T, V> {
    this.data.typeOrganizer = organizer;
    return this;
  }

  public valueOrganizer(organizer: SettingValueOrganizer<any>): SettingBuilder<T, V> {
    this.data.valueOrganizer = organizer;
    return this;
  }

  public modes(...modes: SettingMode[]): SettingBuilder<T, V> {
    this.data.modes = modes;
    return this;
  }

  public mode(mode: SettingMode): SettingBuilder<T, V> {
    this.data.modes.push(mode);
    return this;
  }

  public help(handler: (context: CommandContext) => void): SettingBuilder<T, V> {
    this.data.help = handler;
    return this;
  }

  /*public getHandler(handler: (t: T) => Promise<V | undefined>): SettingBuilder<T, V> {
    this.data.get = handler;
    return this;
  }*/

  public handler(handler: (t: T, v: V, mode?: SettingMode, currentModeArgs?: string[]) => Promise<SettingChangeStatus<V>>): Setting<T, V> {
    return {
      name: this.data.name,
      typeOrganizer: this.data.typeOrganizer,
      valueOrganizer: this.data.valueOrganizer,
      getModes: () => {
        return this.data.modes;
      },
      getAllModesAliases: () => {
        return this.data.modes.flatMap((mode) => mode.getAliases());
      },
      help: this.data.help
        ? this.data.help
        : (context) => {
            context.getMessage().channel.send(createHelpEmbed(context, this.data));
          },
      // get: this.data.get,
      handle: handler,
    };
  }
}

function createHelpEmbed(
  context: CommandContext,
  data: {
    name?: string;
    typeOrganizer?: (context: CommandContext) => any;
    valueOrganizer: SettingValueOrganizer<any>;
    modes: SettingMode[];
    help?: (context: CommandContext) => void;
    // get?: (t: any) => Promise<any>;
  }
): MessageEmbed {
  return context
    .createEmbedBuilder()
    .setDescription(
      `\`${
        StringUtil.capitalize(data.name, 'tr-TR')
      }\` Ayarı hakkında yardım;\n\nKullanım: \`${context.getOrganizedPrefix()}${context.getLabel()} ${
        data.name
      } <mod> [<değer>]\`\nYapabileceğiniz düzenleme modları:\n${data.modes.map((mode) => `${mode.getAliases().map((aliases) => `\`${aliases}\``).join(', ')}${mode.getHelpMessage() ? ' - ' + mode.getHelpMessage() : ''}`).join('\n')}`
    )
    .setColor('#b3e324')
    .setAuthor('Peww', context.getMessage().client.user.avatarURL());
}
