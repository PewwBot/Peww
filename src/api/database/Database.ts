import 'reflect-metadata';
import { Connection, createConnection, ConnectionOptions } from 'typeorm';
import { Bot } from '../../Bot';

export type Mode = 'test' | 'normal';

export class Database {
  private connection: Connection;

  public load(mode: Mode = 'normal', callback: (error: Error) => void) {
    createConnection({
      type: 'sqlite',
      database: Bot.getInstance().getMainFolder() + 'data.db',
      entities: [
        __dirname + '/entity/*.js'
      ],
      synchronize: true,
      logging: mode === 'test'
    } as ConnectionOptions).then((connection: Connection) => {
      this.connection = connection;
      callback(null);
    }).catch((error: Error) => {
      callback(error);
    });
  }

  public getConnection(): Connection {
    return this.connection;
  }

}