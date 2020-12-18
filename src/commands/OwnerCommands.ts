import * as Discord from 'discord.js';
import { AbstractCommand } from '../api/command/AbstractCommand';
import { Command } from '../api/command/Command';
import { CommandCategory } from '../api/command/CommandCategory';
import { CommandPermissions } from '../api/command/CommandPermission';
import { CommandContext } from '../api/command/context/CommandContext';
import { PewwGuild } from '../structures/GuildStructure';
import { MentionUtil } from '../utils/MentionUtil';
import { CommandBatchRegisterer } from './../api/command/CommandBatchRegisterer';

export class OwnerCommands extends CommandBatchRegisterer {
  get(): Command[] {
    return [new CheckStaffCommand()];
  }
}

export default OwnerCommands;

class CheckStaffCommand extends AbstractCommand {
  constructor() {
    super({
      name: 'checkStaff',
    });
  }

  init() {
    this.setupOptions({
      aliases: ['check_staff'],
      description: 'Checks the specified member is staff.',
      category: CommandCategory.MANAGEMENT,
      requiredCustomPermission: CommandPermissions.OWNER,
    });
  }

  async run(context: CommandContext): Promise<void> {
    let member: Discord.GuildMember;
    if (context.getArgs().length < 1) {
      member = context.getMessage().member;
    } else {
      member = MentionUtil.getMemberFromMention(context.getMessage().guild, context.getArgs()[0]);
    }
    if (!member) {
      context.getMessage().react('❌');
      context.getMessage().channel.send(context.createEmbedBuilder().setDescription('Bir üye belirtmeniz gerekiyor!'));
      return;
    }
    const guild: PewwGuild = (await context.getBot().guilds.cache.get(context.getMessage().guild.id)) as PewwGuild;
    if (!guild) {
      context.getMessage().react('❌');
      context
        .getMessage()
        .channel.send(
          context.createEmbedBuilder().setDescription('Sunucu bilgileri eksik! Lütfen destek ekibiyle iletişime geçin.')
        );
      return;
    }
    await guild.load();
    context.getMessage().react('✅');
    context.getMessage().channel.send(
      context
        .createEmbedBuilder()
        .setDescription(`<@!${member.id}> adlı üye \`${guild.isStaff(member) ? 'Yetkili' : 'Yetkili Değil'}\``)
        .setColor('#b3e324')
        .setAuthor('Peww', context.getMessage().client.user.avatarURL())
    );
  }
}
