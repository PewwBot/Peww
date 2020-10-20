import * as Discord from 'discord.js';
import { Logger } from 'tslog';
import { CommandCategory } from './api/command/CommandCategory';
import { CommandManager } from './api/command/CommandManager';
import { Commands } from './api/command/Commands';
import { Config } from './Config';

export class Bot {
  private static instance: Bot;

  private client: Discord.Client;
  private config: Config;
  private logger: Logger = new Logger({ prefix: ['[PewwBot]'], displayDateTime: false, displayFilePath: 'hidden' });

  private commandManager: CommandManager;

  public start(callback: (error: Error) => void) {
    Bot.instance = this;
    this.config = new Config();
    this.config.load((error: Error) => {
      if (error) {
        callback(error);
        return;
      }
      this.client = new Discord.Client({});
      this.client
        .login(this.config.getData().token)
        .then((_value) => {
          this.commandManager = new CommandManager();
          callback(null);
        })
        .catch((error: Error) => {
          callback(error);
        });
    });
  }

  public static getInstance(): Bot {
    return Bot.instance;
  }

  public getClient(): Discord.Client {
    return this.client;
  }

  public getConfig(): Config {
    return this.config;
  }

  public getLogger(): Logger {
    return this.logger;
  }

  public getCommandManager(): CommandManager {
    return this.commandManager;
  }
}
