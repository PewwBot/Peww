import * as Discord from 'discord.js';
import { Bot } from './../Bot';
import { Command } from '../api/command/Command';
import { CommandCategory } from '../api/command/CommandCategory';
import { Commands } from '../api/command/Commands';
import { CommandBatchRegisterer } from './../api/command/CommandBatchRegisterer';
export class ManagementCommands implements CommandBatchRegisterer {
  get(): Command[] {
    return [SQL_RUN];
  }
}

const SQL_RUN: Command = Commands.create()
  .name('sqlRun')
  .aliases(['sqlrun'])
  .description('Used to apply changes to the database.')
  .category(CommandCategory.MANAGEMENT)
  .handler((context) => {
    if (context.getMessage().member.id !== context.getBot().getConfig().getData().ownerId) {
      context.getMessage().delete();
      return;
    }

    if (context.getArgs().length < 1) {
      context.getMessage().channel.send('I need you to tell me what to do to make any changes to the database.');
      return;
    }

    context
      .getBot()
      .getDatabase()
      .getConnection()
      .query(context.getArgs().join(' '))
      .then((rows: any) => {
        context.getMessage().react('✅');
        if (rows && (Array.isArray(rows) && rows.length > 0)) {
          context.getMessage().channel.send(new Discord.MessageEmbed({
            author: { name: 'Peww', iconURL: context.getBot().getClient().user.avatarURL() },
            description: `\`\`\`\n${rows.map((row) => JSON.stringify(row, null, '\t')).join('\n')}\n\`\`\``,
            color: '#29c458'
          }));
        }
      })
      .catch((error: Error) => {
        context.getBot().getLogger().prettyError(error);
        context.getMessage().react('❌');
        context.getMessage().channel.send('An error occurred while performing database operations! Error log sent to console!');
      });
  });
