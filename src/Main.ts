import { ManagementCommands } from './commands/ManagementCommands';
import { CommandCategory } from './api/command/CommandCategory';
import { Commands } from './api/command/Commands';
import { Bot } from './Bot';

const bot = new Bot();
bot.start((error: Error) => {
  if (error) {
    bot.getLogger().prettyError(error);
    return;
  }
  bot.getLogger().info(`has been successfully logged! [${bot.getClient().guilds.cache.size} Guilds]`);
  bot.getCommandManager().registerBatchClass(new ManagementCommands());
});
