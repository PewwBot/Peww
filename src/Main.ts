import * as path from 'path';
import { Database } from './api/database/Database';
import { StructureManager } from './api/structure/StructureManager';
import { PewwBot } from './PewwBot';

const structureManager: StructureManager = new StructureManager();
structureManager.registerPath(path.join(__dirname, 'structures/')).then(() => {
  Database.load('test')
    .then(() => {
      const bot = new PewwBot();
      bot.on('ready', async () => {
        bot.getLogger().info(`has been successfully logged! [${bot.guilds.cache.size} Guilds]`);
        await bot.getArgumentManager().registerPath(path.join(bot.getMainFolder(), 'arguments/'));
        await bot.getSubscriptionManager().registerPath(path.join(bot.getMainFolder(), 'subscriptions/'));
        await bot.getCommandManager().registerPath(path.join(bot.getMainFolder(), 'commands/'));
        await bot.getSchedulerManager().registerPath(path.join(bot.getMainFolder(), 'schedulers/'));
        await bot.getSettingManager().registerPath(path.join(bot.getMainFolder(), 'settings/'));
        bot.getLogger().info(`${bot.getSubscriptionManager().getCount()} Subscription loaded!`);
        bot.getLogger().info(`${bot.getArgumentManager().getCount()} Argument loaded!`);
        bot.getLogger().info(`${bot.getCommandManager().getCount()} Command loaded!`);
        bot.getLogger().info(`${bot.getSchedulerManager().getCount()} Scheduler loaded!`);
        bot.getLogger().info(`${bot.getSettingManager().getCount()} Setting loaded!`);
      });
    })
    .catch((_error) => {
      console.log(_error);
    });
});
