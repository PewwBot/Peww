import { CommandContext } from './../command/context/CommandContext';
import { SettingChangeStatus } from './SettingChangeStatus';
import { Setting } from './Setting';
import { MessageEmbed } from 'discord.js';
import { SettingValueOrganizer } from './SettingValueOrganizer';
import { EmptyOrganizer } from './organizers/EmptyOrganizer';

export class SettingBuilder<T, V> {
  private data: {
    name?: string;
    typeOrganizer?: (context: CommandContext) => any;
    valueOrganizer: SettingValueOrganizer<any>;
    modes?: string[];
    help?: (context: CommandContext) => void;
    get?: (t: T) => Promise<V>;
  } = { valueOrganizer: new EmptyOrganizer() };

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

  public modes(...modes: string[]): SettingBuilder<T, V> {
    this.data.modes = modes;
    return this;
  }

  public help(handler: (context: CommandContext) => void): SettingBuilder<T, V> {
    this.data.help = handler;
    return this;
  }

  public getHandler(handler: (t: T) => Promise<V | undefined>): SettingBuilder<T, V> {
    this.data.get = handler;
    return this;
  }

  public changeHandler(handler: (t: T, v: V, mode?: string) => Promise<SettingChangeStatus<V>>): Setting<T, V> {
    return {
      name: this.data.name,
      typeOrganizer: this.data.typeOrganizer,
      valueOrganizer: this.data.valueOrganizer,
      getModes: () => {
        return this.data.modes;
      },
      help: this.data.help
        ? this.data.help
        : (context) => {
            context.getMessage().channel.send(createHelpEmbed(context, this.data));
          },
      get: this.data.get,
      change: handler,
    };
  }
}

function createHelpEmbed(
  context: CommandContext,
  data: {
    name?: string;
    modes?: any[];
    help?: (context: CommandContext) => void;
    get?: (t: any) => Promise<any>;
  }
): MessageEmbed {
  return context
    .createEmbedBuilder()
    .setDescription(
      `\`${
        data.name.charAt(0).toLocaleUpperCase('tr-TR') + data.name.slice(1)
      }\` Ayarı hakkında yardım;\n\nKullanım: \`${context.getOrganizedPrefix()}${context.getLabel()} ${
        data.name
      } <mod> [<değer>]\`\nYapabileceğiniz düzenleme modları:\n${data.modes.map((mode) => `\`${mode}\``).join('\n')}`
    )
    .setColor('#b3e324')
    .setAuthor('Peww', context.getMessage().client.user.avatarURL());
}
