import { PewwBot } from './PewwBot';
import { EntrySetting } from './settings/EntrySetting';
import { PrefixSetting } from './settings/PrefixSetting';
import { StaffSetting } from './settings/StaffSetting';
import { Database } from './api/database/Database';
import * as path from 'path';

Database.load('test')
  .then(() => {
    const bot = new PewwBot();
    bot.on('ready', async () => {
      bot.getLogger().info(`has been successfully logged! [${bot.guilds.cache.size} Guilds]`);
      await bot.getSubscriptionManager().registerPath(path.join(bot.getMainFolder(), 'subscriptions/'));
      await bot.getCommandManager().registerPath(path.join(bot.getMainFolder(), 'commands/'));
      await bot.getSchedulerManager().registerPath(path.join(bot.getMainFolder(), 'schedulers/'));
      bot.getSettingManager().registerAllClass(new PrefixSetting(), new EntrySetting(), new StaffSetting());
      bot.getLogger().info(`${bot.getSubscriptionManager().getCount()} Subscription loaded!`);
      bot.getLogger().info(`${bot.getCommandManager().getCount()} Command loaded!`);
      bot.getLogger().info(`${bot.getSchedulerManager().getCount()} Scheduler loaded!`);
    });
  })
  .catch((_error) => {
    console.log(_error);
  });
