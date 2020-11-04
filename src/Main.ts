import { GuildControlScheduler } from './schedulers/GuildControlScheduler';
import { ManagementCommands } from './commands/ManagementCommands';
import { Bot } from './Bot';
import { GuildSubscriptions } from './subscriptions/GuildSubscriptions';
import { SettingCommands } from './commands/SettingCommands';
import { EntrySetting } from './settings/EntrySetting';
import { PrefixSetting } from './settings/PrefixSetting';
import { StaffSetting } from './settings/StaffSetting';
import { OwnerCommands } from './commands/OwnerCommands';

const bot = new Bot();
bot.start((error: Error) => {
  if (error) {
    bot.getLogger().prettyError(error);
    return;
  }
  bot.getLogger().info(`has been successfully logged! [${bot.getClient().guilds.cache.size} Guilds]`);
  bot.getSubscriptionManager().registerBatchClass(new GuildSubscriptions());
  bot.getCommandManager().registerAllBatchClass(new ManagementCommands(), new SettingCommands(), new OwnerCommands());
  bot.getSchedulerManager().registerClass(new GuildControlScheduler());
  bot.getSettingManager().registerAllClass(new PrefixSetting(), new EntrySetting(), new StaffSetting());
});
