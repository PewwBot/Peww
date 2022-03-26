import { Client, ClientOptions } from 'discord.js';
import { Service } from 'typedi';
import { BotClient, BotSettings } from './types/bot';
import { settings as configuration } from './config/config';
import { Logger } from './utils/logger';
import { Management } from './management';
import path from 'path';

@Service()
export class PewwClient extends Client implements BotClient {
  public settings: BotSettings;

  constructor(private management: Management) {
    super(configuration.clientOptions || ({} as ClientOptions));
    this.settings = configuration;
    this.settings.token = process.env.BOT_TOKEN;
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      await this.login(this.settings.token);

      await this.management.commandManager.registerPath(path.join(this.mainFolder, 'commands/'));
    } catch (e) {
      Logger.error(`Could not initialize bot: ${e}`);
    }
  }

  public get mainFolder(): string {
    return path.join(__dirname, '');
  }
}
