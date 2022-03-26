import { ClientOptions } from 'discord.js';

export interface BotClient {
  settings: BotSettings;
}

export interface BotSettings {
  clientOptions?: ClientOptions;
  token?: string;
  prefix: string[];
}
