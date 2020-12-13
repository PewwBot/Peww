import { GuildControlScheduler } from './schedulers/GuildControlScheduler';
import { PewwBot } from './PewwBot';
import { GuildSubscriptions } from './subscriptions/GuildSubscriptions';
import { EntrySetting } from './settings/EntrySetting';
import { PrefixSetting } from './settings/PrefixSetting';
import { StaffSetting } from './settings/StaffSetting';

const bot = new PewwBot();
bot.on('ready', () => {
  bot.getLogger().info(`has been successfully logged! [${bot.guilds.cache.size} Guilds]`);
  bot.getSubscriptionManager().registerBatchClass(new GuildSubscriptions(bot));
  // bot.getCommandManager().registerAllBatchClass(new ManagementCommands(), new SettingCommands(), new OwnerCommands());
  bot.getSchedulerManager().registerClass(new GuildControlScheduler(bot));
  bot.getSettingManager().registerAllClass(new PrefixSetting(), new EntrySetting(), new StaffSetting());
});