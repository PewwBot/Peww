// import { PrefixSetting } from './settings/PrefixSetting';
import { GuildControlScheduler } from './schedulers/GuildControlScheduler';
import { ManagementCommands } from './commands/ManagementCommands';
import { Bot } from './Bot';
import { GuildSubscriptions } from './subscriptions/GuildSubscriptions';
import { SettingCommands } from './commands/SettingCommands';
import { EntrySetting } from './settings/EntrySetting';

const bot = new Bot();
bot.start((error: Error) => {
  if (error) {
    bot.getLogger().prettyError(error);
    return;
  }
  bot.getLogger().info(`has been successfully logged! [${bot.getClient().guilds.cache.size} Guilds]`);
  bot.getSubscriptionManager().registerBatchClass(new GuildSubscriptions());
  bot.getCommandManager().registerAllBatchClass(new ManagementCommands(), new SettingCommands());
  bot.getSchedulerManager().registerClass(new GuildControlScheduler());
  bot.getSettingManager().registerAllClass(new EntrySetting());
});
