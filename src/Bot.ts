import { SchedulerManager } from './api/scheduler/SchedulerManager';
import * as Discord from 'discord.js';
import { Logger } from 'tslog';
import { CommandManager } from './api/command/CommandManager';
import { Database } from './api/database/Database';
import { SubscriptionManager } from './api/subscription/SubscriptionManager';
import { Config } from './Config';
import { CacheManager } from './api/cache/CacheManager';
import * as fs from 'fs';
import * as path from 'path';
import { LocaleManager } from './api/locale/LocaleManager';

// tslint:disable-next-line: no-var-requires
const PastebinAPI = require('pastebin-js');

export class Bot {
  private static instance: Bot;

  private mainFolder: string;

  private client: Discord.Client;
  private config: Config;
  private logger: Logger = new Logger({
    prefix: ['[PewwBot]'],
    displayDateTime: false,
    displayFilePath: 'hidden',
    displayFunctionName: false,
  });

  private database: Database;
  private cacheManager: CacheManager;
  private localeManager: LocaleManager;
  private commandManager: CommandManager;
  private subscriptionManager: SubscriptionManager;
  private schedulerManager: SchedulerManager;

  private pastebin: typeof PastebinAPI;

  public start(callback: (error: Error) => void) {
    Bot.instance = this;
    this.mainFolder = path.join(__dirname, '');
    this.config = new Config();
    this.config.load((error: Error) => {
      if (error) {
        callback(error);
        return;
      }
      this.localeManager = new LocaleManager();
      this.localeManager.load((error) => {
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
          this.pastebin = new PastebinAPI({
            api_dev_key: this.config.getData().pastebin.apikey,
            api_user_name: this.config.getData().pastebin.username,
            api_user_password: this.config.getData().pastebin.password,
          });
          this.cacheManager = new CacheManager();
          this.client = new Discord.Client({});
          this.client
            .login(this.config.getData().token)
            .then((_value) => {
              // this.loadAllGuilds();
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
    });
  }

  private async loadAllGuilds(): Promise<void> {
    for (const guild of this.getClient().guilds.cache.array()) {
      await this.cacheManager.getGuild(guild.id);
    }
  }

  public static getInstance(): Bot {
    return Bot.instance;
  }

  public getMainFolder(): string {
    return this.mainFolder;
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

  public getCacheManager(): CacheManager {
    return this.cacheManager;
  }

  public getLocaleManager(): LocaleManager {
    return this.localeManager;
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

  public getPastebin(): typeof PastebinAPI {
    return this.pastebin;
  }
}
