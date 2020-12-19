import { Message, MessageEmbed } from 'discord.js';
import { Command } from './Command';
import { CommandContext } from './context/CommandContext';

export type ErrorType = 'Invalid Argument' | 'Command Failure';

export class CommandMethods {
  private command: Command;

  constructor(command: Command) {
    this.command = command;
  }

  public async sendErrorMessage(context: CommandContext, errorType: ErrorType, reason: string): Promise<Message> {
    const prefix = context.getOrganizedPrefix();
    const embed = new MessageEmbed()
      .setAuthor(`${context.getMessage().author.tag}`, context.getMessage().author.displayAvatarURL({ dynamic: true }))
      .setTitle(`:octagonal_sign: Error: \`${context.getCommand().name}\``)
      .setDescription(`\`\`\`diff\n- ${errorType}\n+ ${reason}\`\`\``)
      .addField('Usage', `\`${prefix}${context.getCommand().usage}\``)
      .setTimestamp()
      .setColor(context.getMessage().guild.me.displayHexColor);
    if (context.getCommand().examples) embed.addField('Examples', context.getCommand().examples.map((e) => `\`${prefix}${e}\``).join('\n'));
    return context.getMessage().channel.send(embed);
  }
}
