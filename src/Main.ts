import * as Discord from 'discord.js';
import { Bot } from './Bot';

const bot = new Bot();
bot.start((error: Error) => {
  if (error) {
    bot.getLogger().prettyError(error);
    return;
  }
  bot.getLogger().info(`has been successfully logged! [${bot.getClient().guilds.cache.size} Guilds]`);
});