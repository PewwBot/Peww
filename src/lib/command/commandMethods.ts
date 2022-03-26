import { Message, MessageEmbed } from "discord.js";
import { CommandContext } from "../../types";
import { Command } from "./command";

export type ErrorType = 'Invalid Argument' | 'Command Failure';

export class CommandMethods {
  private command: Command;

  constructor(command: Command) {
    this.command = command;
  }

  public async sendErrorMessage(context: CommandContext, errorType: ErrorType, reason: string): Promise<Message> {
    const prefix = context.organizedPrefix;
    const embed = new MessageEmbed()
      .setAuthor(`${context.message.author.tag}`, context.message.author.displayAvatarURL({ dynamic: true }))
      .setTitle(`:octagonal_sign: Error: \`${context.command.config.name}\``)
      .setDescription(`\`\`\`diff\n- ${errorType}\n+ ${reason}\`\`\``)
      .addField('Usage', `\`${prefix}${context.command.config.usage}\``)
      .setTimestamp()
      .setColor(context.message.guild.me.displayHexColor);
    if (context.command.config.examples) embed.addField('Examples', context.command.config.examples.map((e) => `\`${prefix}${e}\``).join('\n'));
    return context.message.channel.send({ embeds: [embed] });
  }
}

