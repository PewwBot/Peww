import { TextStyle } from '@js-joda/core';

import * as Discord from 'discord.js';
import { Bot } from '../../Bot';

export class CommandPermissions {
  public static USER: CommandPermission = {
    test: async () => {
      return true;
    },
  } as CommandPermission;

  public static BOT_OWNER: CommandPermission = {
    test: async (member) => {
      if (!(member instanceof Discord.GuildMember)) return false;
      return member.id === Bot.getInstance().getConfig().getData().ownerId;
    },
  } as CommandPermission;

  public static OWNER: CommandPermission = {
    test: async (member) => {
      if (!(member instanceof Discord.GuildMember)) return false;
      return member.guild.ownerID === member.id;
    },
  } as CommandPermission;

  public static STAFF: CommandPermission = {
    test: async (member) => {
      if (!(member instanceof Discord.GuildMember)) return false;
      const guildData = await Bot.getInstance().getCacheManager().getGuild(member.guild.id);
      return (
        member.guild.ownerID === member.id ||
        member.hasPermission('ADMINISTRATOR') ||
        member.hasPermission('MANAGE_GUILD') ||
        (guildData && guildData.isStaff(member))
      );
    },
  } as CommandPermission;
}

export interface CommandPermission {
  test(object: Discord.GuildMember | Discord.User): Promise<boolean>;
}
