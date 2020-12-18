import * as Discord from 'discord.js';
import { PewwGuild } from '../../structures/GuildStructure';
import { CommandError } from './CommandError';
import { CommandContext } from './context/CommandContext';

export class CommandPermissions {
  public static USER: CommandPermission = {
    test: async () => {},
  } as CommandPermission;

  public static BOT_OWNER: CommandPermission = {
    test: async (context) => {
      if (!(context.getMessage().member instanceof Discord.GuildMember)) return false;
      if (context.getMessage().member.id !== context.getBot().getConfig().getData().ownerId) {
        throw new CommandError('Bu komutu sadece bot sahibi kullanabilir!');
      }
    },
  } as CommandPermission;

  public static OWNER: CommandPermission = {
    test: async (context) => {
      if (!(context.getMessage().member instanceof Discord.GuildMember)) return false;
      if (context.getMessage().guild.ownerID !== context.getMessage().member.id) {
        throw new CommandError('Bu komutu sadece sunucu sahibi kullanabilir!');
      }
    },
  } as CommandPermission;

  public static STAFF: CommandPermission = {
    test: async (context) => {
      if (!(context.getMessage().member instanceof Discord.GuildMember)) return false;
      const guild: PewwGuild = await context.getBot().guilds.cache.get(context.getMessage().guild.id) as PewwGuild;
      if (
        !(
          context.getMessage().guild.ownerID === context.getMessage().member.id ||
          context.getMessage().member.hasPermission('ADMINISTRATOR') ||
          context.getMessage().member.hasPermission('MANAGE_GUILD') ||
          (guild && guild.isStaff(context.getMessage().member))
        )
      ) {
        throw new CommandError('Bu komutu sadece sunucu yetkilisi kullanabilir!');
      }
    },
  } as CommandPermission;
}

export interface CommandPermission {
  test(context: CommandContext): void;
}
