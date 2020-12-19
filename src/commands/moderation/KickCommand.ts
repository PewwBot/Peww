import { MessageEmbed } from 'discord.js';
import { AbstractCommand } from '../../api/command/AbstractCommand';
import { CommandCategory } from '../../api/command/CommandCategory';
import { CommandPermissions } from '../../api/command/CommandPermission';
import { CommandContext } from '../../api/command/context/CommandContext';
import { MentionUtil } from '../../utils/MentionUtil';

export class KickCommand extends AbstractCommand {
  constructor() {
    super({
      name: 'kick',
    });
  }

  init() {
    this.setupOptions({
      mode: 'normal',
      aliases: ['kick'],
      description: 'Kicks a member from your server.',
      usage: 'kick <user mention/ID> [reason]',
      examples: ['kick @Draww'],
      category: CommandCategory.MODERATION,
      requiredBotPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'KICK_MEMBERS'],
      requiredPermission: CommandPermissions.STAFF,
    });
  }

  async run(context: CommandContext): Promise<void> {
    if (context.getArgs().length < 1) {
      this.methods.sendErrorMessage(context, 'Invalid Argument', 'Please mention a user or provide a valid user ID');
      return;
    }
    const member = MentionUtil.getMemberFromMention(context.getMessage().guild, context.getArgs()[0]);
    if (!member) {
      this.methods.sendErrorMessage(context, 'Invalid Argument', 'Please mention a user or provide a valid user ID');
      return;
    }
    if (member.id === context.getMessage().member.id) {
      this.methods.sendErrorMessage(context, 'Invalid Argument', 'You cannot kick yourself!');
      return;
    }
    if (member.roles.highest.position >= context.getMessage().member.roles.highest.position) {
      this.methods.sendErrorMessage(
        context,
        'Invalid Argument',
        'You cannot kick someone with an equal or higher role'
      );
      return;
    }
    if (!member.kickable) {
      this.methods.sendErrorMessage(context, 'Invalid Argument', 'Provided member is not kickable');
      return;
    }

    let reason = context.getArgs().slice(1).join(' ');
    if (!reason) reason = '`None`';
    if (reason.length > 1024) reason = reason.slice(0, 1021) + '...';

    await member.kick(reason);
    await context.getMessage().react('✅');

    const embed = new MessageEmbed()
      .setTitle('Kick Member')
      .setDescription(`<@!${member.id}> was successfully kicked.`)
      .addField('Moderator', `<@!${context.getMessage().member.id}>`, true)
      .addField('Member', `<@!${member.id}>`, true)
      .addField('Reason', reason)
      .setFooter(
        context.getMessage().member.displayName,
        context.getMessage().author.displayAvatarURL({ dynamic: true })
      )
      .setTimestamp()
      .setColor(context.getMessage().guild.me.displayHexColor);
    context.getMessage().channel.send(embed);
  }
}
