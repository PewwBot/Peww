import * as Discord from 'discord.js';
export class MentionUtil {
  public static getMemberFromMention(guild: Discord.Guild, mention: string): Discord.GuildMember {
    const matches = mention.match(/^<@!?(\d+)>$/);
    if (!matches) return null;

    const id = matches[1];
    return guild.members.cache.get(id);
  }

  public static getChannelFromMention(guild: Discord.Guild, mention: string): Discord.GuildChannel {
    const matches = mention.match(/^<#(\d+)>$/);
    if (!matches) return null;

    const id = matches[1];
    return guild.channels.cache.get(id);
  }

  public static getRoleFromMention(guild: Discord.Guild, mention: string): Discord.Role {
    const matches = mention.match(/^<@&(\d+)>$/);
    if (!matches) return null;

    const id = matches[1];
    return guild.roles.cache.get(id);
  }
}
