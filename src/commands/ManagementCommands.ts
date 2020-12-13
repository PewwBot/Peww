import * as Discord from 'discord.js';
import { Command } from '../api/command/Command';
import { CommandCategory } from '../api/command/CommandCategory';
import { CommandBatchRegisterer } from './../api/command/CommandBatchRegisterer';

import * as util from 'util';
import { CommandContext } from '../api/command/context/CommandContext';
import { CommandPermissions } from '../api/command/CommandPermission';
import { AbstractCommand } from '../api/command/AbstractCommand';
import { Database } from '../api/database/Database';

export class ManagementCommands extends CommandBatchRegisterer {
  get(): Command[] {
    return [new TestCommand(), new SqlRunCommand(), new EvalCommand(), new EvalReloadCommand()];
  }
}

export default ManagementCommands;

class TestCommand extends AbstractCommand {
  constructor() {
    super({
      name: 'test',
      aliases: ['test'],
      description: 'Test some staff.',
      category: CommandCategory.MANAGEMENT,
      requiredCustomPermission: CommandPermissions.BOT_OWNER,
    });
  }

  run(_context: CommandContext): void {}
}

class SqlRunCommand extends AbstractCommand {
  constructor() {
    super({
      name: 'sqlRun',
      aliases: ['sqlrun'],
      description: 'Used to apply changes to the database.',
      category: CommandCategory.MANAGEMENT,
      requiredCustomPermission: CommandPermissions.BOT_OWNER,
    });
  }

  run(context: CommandContext): void {
    if (context.getArgs().length < 1) {
      context.getMessage().channel.send('I need you to tell me what to do to make any changes to the database.');
      return;
    }

    Database.getConnection()
      .query(context.getArgs().join(' '))
      .then((rows: any) => {
        context.getMessage().react('✅');
        if (rows && Array.isArray(rows) && rows.length > 0) {
          context.getMessage().channel.send(
            new Discord.MessageEmbed({
              author: { name: 'Peww', iconURL: context.getBot().user.avatarURL() },
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
  }
}

class EvalCommand extends AbstractCommand {
  constructor() {
    super({
      name: 'eval',
      aliases: ['eval', 'evalpastebin', 'evalfile'],
      description: 'used to run code.',
      category: CommandCategory.MANAGEMENT,
      requiredCustomPermission: CommandPermissions.BOT_OWNER,
    });
  }

  async run(context: CommandContext): Promise<void> {
    if (context.getArgs().length < 1) {
      context.getMessage().channel.send('I want you to tell me what I have to do to play the code.');
      return;
    }

    if (context.getLabel() === 'eval') {
      const code = context.getArgs().join(' ');
      await evaluate(context, code);
    } else if (context.getLabel() === 'evalfile') {
      const code = context.getBot().getConfig().getEval(context.getArgs()[0]);
      if (!code) return;
      await evaluate(context, code);
    } else {
      context
        .getBot()
        .getPastebin()
        .getPaste(context.getArgs()[0])
        .then(async (data: any) => {
          const code = data;
          if (!code) return;
          await evaluate(context, code);
        })
        .fail((error: any) => {
          context.getMessage().react('❌');
          context.getMessage().channel.send(`\`ERROR\` \`\`\`xl\n${clean(error)}\n\`\`\``);
        });
    }
  }
}

class EvalReloadCommand extends AbstractCommand {
  constructor() {
    super({
      name: 'evalReload',
      aliases: ['evalreload'],
      description: 'the code is used to refresh files in the eval system.',
      category: CommandCategory.MANAGEMENT,
      requiredCustomPermission: CommandPermissions.BOT_OWNER,
    });
  }

  run(context: CommandContext): void {
    context.getBot().getConfig().reloadEval();
    context.getMessage().react('✅');
  }
}

async function evaluate(context: CommandContext, code: string) {
  try {
    // tslint:disable-next-line: no-eval
    let evaled = await eval(code);

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
