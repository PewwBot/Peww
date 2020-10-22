import * as Discord from 'discord.js';
import { Bot } from './../Bot';
import { Command } from '../api/command/Command';
import { CommandCategory } from '../api/command/CommandCategory';
import { Commands } from '../api/command/Commands';
import { CommandBatchRegisterer } from './../api/command/CommandBatchRegisterer';

import * as util from 'util';
import { CommandContext } from '../api/command/context/CommandContext';

export class ManagementCommands implements CommandBatchRegisterer {
  get(): Command[] {
    return [TEST, SQL_RUN, EVAL];
  }
}

const TEST: Command = Commands.create()
  .name('test')
  .aliases(['test'])
  .description('Test some staff.')
  .category(CommandCategory.MANAGEMENT)
  .handler((context) => {});

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
        if (rows && Array.isArray(rows) && rows.length > 0) {
          context.getMessage().channel.send(
            new Discord.MessageEmbed({
              author: { name: 'Peww', iconURL: context.getBot().getClient().user.avatarURL() },
              description: `\`\`\`\n${rows.map((row) => JSON.stringify(row, null, '\t')).join('\n')}\n\`\`\``,
              color: '#29c458',
            })
          );
        }
      })
      .catch((error: Error) => {
        context.getBot().getLogger().prettyError(error);
        context.getMessage().react('❌');
        context
          .getMessage()
          .channel.send('An error occurred while performing database operations! Error log sent to console!');
      });
  });

const EVAL: Command = Commands.create()
  .name('eval')
  .aliases(['eval', 'evalpastebin', 'evalfile'])
  .description('')
  .category(CommandCategory.MANAGEMENT)
  .handler((context) => {
    if (context.getMessage().member.id !== context.getBot().getConfig().getData().ownerId) {
      context.getMessage().delete();
      return;
    }

    if (context.getArgs().length < 1) {
      context.getMessage().channel.send('I want you to tell me what I have to do to play the code.');
      return;
    }

    if (context.getLabel() === 'eval') {
      const code = context.getArgs().join(' ');
      evaluate(context, code);
    } else if (context.getLabel() === 'evalfile') {
      const code = context.getBot().getConfig().getEval(context.getArgs()[0]);
      if (!code) return;
      evaluate(context, code);
    } else {
      context
        .getBot()
        .getPastebin()
        .getPaste(context.getArgs()[0])
        .then((data: any) => {
          const code = data;
          if (!code) return;
          evaluate(context, code);
        })
        .fail((error: any) => {
          context.getMessage().react('❌');
          context.getMessage().channel.send(`\`ERROR\` \`\`\`xl\n${clean(error)}\n\`\`\``);
        });
    }
  });

function evaluate(context: CommandContext, code: string) {
  try {
    // tslint:disable-next-line: no-eval
    let evaled = eval(code);

    if (typeof evaled !== 'string') evaled = util.inspect(evaled, { depth: 0 });

    context.getMessage().react('✅');
    context.getMessage().channel.send(clean(evaled), { code: 'xl' });
  } catch (error) {
    context.getMessage().react('❌');
    context.getMessage().channel.send(`\`ERROR\` \`\`\`xl\n${clean(error)}\n\`\`\``);
  }
}

function clean(text: any) {
  if (typeof text === 'string')
    return text.replace(/`/g, '`' + String.fromCharCode(8203)).replace(/@/g, '@' + String.fromCharCode(8203));
  else return text;
}
