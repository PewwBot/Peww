import 'reflect-metadata';
import { Connection, createConnection, ConnectionOptions } from 'typeorm';
import { PewwBot } from '../../PewwBot';

export type Mode = 'test' | 'normal';

export class Database {
  private bot: PewwBot;
  private connection: Connection;

  constructor(bot: PewwBot) {
    this.bot = bot;
  }

  public async load(mode: Mode = 'normal'): Promise<void> {
    const connection = await createConnection({
      type: 'sqlite',
      database: this.bot.getMainFolder() + '/data.db',
      entities: [__dirname + '/entity/*.js'],
      synchronize: true,
      logging: mode === 'test',
    } as ConnectionOptions);
    if (connection) this.connection = connection;
  }

  public getConnection(): Connection {
    return this.connection;
  }
}
