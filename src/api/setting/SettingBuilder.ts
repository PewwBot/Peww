import { CommandContext } from './../command/context/CommandContext';
import { SettingChangeStatus } from './SettingChangeStatus';
import { Setting } from './Setting';
import { MessageEmbed } from 'discord.js';

export class SettingBuilder<T, V, M> {
  private data: {
    name?: string;
    modes?: M[];
    help?: (context: CommandContext) => void;
    get?: (t: T) => Promise<V>;
  } = {};

  constructor(name: string) {
    this.data.name = name;
  }

  public static newBuilder<T, V, M>(name: string): SettingBuilder<T, V, M> {
    return new SettingBuilder(name);
  }

  public name(name: string): SettingBuilder<T, V, M> {
    this.data.name = name;
    return this;
  }

  public modes(...modes: M[]): SettingBuilder<T, V, M> {
    this.data.modes = modes;
    return this;
  }

  public help(handler: (context: CommandContext) => void): SettingBuilder<T, V, M> {
    this.data.help = handler;
    return this;
  }

  public getHandler(handler: (t: T) => Promise<V | undefined>): SettingBuilder<T, V, M> {
    this.data.get = handler;
    return this;
  }

  public changeHandler(handler: (t: T, v: V, mode?: M) => Promise<SettingChangeStatus<V>>): Setting<T, V, M> {
    return {
      name: this.data.name,
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
