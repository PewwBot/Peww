import { SchedulerManager } from './api/scheduler/SchedulerManager';
import * as Discord from 'discord.js';
import { Logger } from 'tslog';
import { CommandManager } from './api/command/CommandManager';
import { Database } from './api/database/Database';
import { SubscriptionManager } from './api/subscription/SubscriptionManager';
import { Config } from './Config';

export class Bot {
  private static instance: Bot;

  private client: Discord.Client;
  private config: Config;
  private logger: Logger = new Logger({ prefix: ['[PewwBot]'], displayDateTime: false, displayFilePath: 'hidden', displayFunctionName: false });

  private database: Database;
  private commandManager: CommandManager;
  private subscriptionManager: SubscriptionManager;
  private schedulerManager: SchedulerManager;

  public start(callback: (error: Error) => void) {
    Bot.instance = this;
    this.config = new Config();
    this.config.load((error: Error) => {
      if (error) {
        callback(error);
        return;
      }
      this.database = new Database();
      this.database.load('test', (error: Error) => {
        if (error) {
          callback(error);
          return;
        }
        this.client = new Discord.Client({});
        this.client
          .login(this.config.getData().token)
          .then((_value) => {
            this.subscriptionManager = new SubscriptionManager();
            this.commandManager = new CommandManager();
            this.schedulerManager = new SchedulerManager();
            callback(null);
          })
          .catch((error: Error) => {
            callback(error);
          });
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

  public getDatabase(): Database {
    return this.database;
  }

  public getCommandManager(): CommandManager {
    return this.commandManager;
  }

  public getSubscriptionManager(): SubscriptionManager {
    return this.subscriptionManager;
  }

  public getSchedulerManager(): SchedulerManager {
    return this.schedulerManager;
  }
}
