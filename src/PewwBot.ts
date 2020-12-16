import { SchedulerManager } from './api/scheduler/SchedulerManager';
import * as Discord from 'discord.js';
import { Logger } from 'tslog';
import { CommandManager } from './api/command/CommandManager';
import { SubscriptionManager } from './api/subscription/SubscriptionManager';
import { Config } from './Config';
import { CacheManager } from './api/cache/CacheManager';
import * as path from 'path';
import { LocaleManager } from './api/locale/LocaleManager';
import { SettingManager } from './api/setting/SettingManager';
import { ArgumentManager } from './api/command/argument/ArgumentManager';

// tslint:disable-next-line: no-var-requires
const PastebinAPI = require('pastebin-js');

export class PewwBot extends Discord.Client {
  private mainFolder: string;

  private config: Config;
  private logger: Logger = new Logger({
    prefix: ['[PewwBot]'],
    displayDateTime: false,
    displayFilePath: 'hidden',
    displayFunctionName: false,
  });

  private cacheManager: CacheManager;
  private localeManager: LocaleManager;
  private argumentManager: ArgumentManager;
  private commandManager: CommandManager;
  private subscriptionManager: SubscriptionManager;
  private schedulerManager: SchedulerManager;
  private settingManager: SettingManager;

  private pastebin: typeof PastebinAPI;

  constructor() {
    super({
      disableMentions: 'everyone',
    });
    this.mainFolder = path.join(__dirname, '');
    this.config = new Config();
    this.config.load();
    this.localeManager = new LocaleManager(this);
    this.localeManager.loadPath(path.join(this.mainFolder, 'locales/'));
    this.pastebin = new PastebinAPI({
      api_dev_key: this.config.getData().pastebin.apikey,
      api_user_name: this.config.getData().pastebin.username,
      api_user_password: this.config.getData().pastebin.password,
    });
    this.cacheManager = new CacheManager(this);
    this.settingManager = new SettingManager(this);
    this.subscriptionManager = new SubscriptionManager(this);
    this.argumentManager = new ArgumentManager(this);
    this.commandManager = new CommandManager(this);
    this.schedulerManager = new SchedulerManager(this);
    super.login(this.config.getData().token);
  }

  public getMainFolder(): string {
    return this.mainFolder;
  }

  public getConfig(): Config {
    return this.config;
  }

  public getLogger(): Logger {
    return this.logger;
  }

  public getCacheManager(): CacheManager {
    return this.cacheManager;
  }

  public getLocaleManager(): LocaleManager {
    return this.localeManager;
  }

  public getArgumentManager(): ArgumentManager {
    return this.argumentManager;
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

  public getSettingManager(): SettingManager {
    return this.settingManager;
  }

  public getPastebin(): typeof PastebinAPI {
    return this.pastebin;
  }
}
