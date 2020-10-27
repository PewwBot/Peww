import { PrefixSetting } from './settings/PrefixSetting';
import { GuildControlScheduler } from './schedulers/GuildControlScheduler';
import { ManagementCommands } from './commands/ManagementCommands';
import { CommandCategory } from './api/command/CommandCategory';
import { Commands } from './api/command/Commands';
import { Bot } from './Bot';
import { GuildSubscriptions } from './subscriptions/GuildSubscriptions';

const bot = new Bot();
bot.start((error: Error) => {
  if (error) {
    bot.getLogger().prettyError(error);
    return;
  }
  bot.getLogger().info(`has been successfully logged! [${bot.getClient().guilds.cache.size} Guilds]`);
  bot.getSubscriptionManager().registerBatchClass(new GuildSubscriptions());
  bot.getCommandManager().registerBatchClass(new ManagementCommands());
  bot.getSchedulerManager().registerClass(new GuildControlScheduler());
  bot.getSettingManager().registerClass(new PrefixSetting());
});
