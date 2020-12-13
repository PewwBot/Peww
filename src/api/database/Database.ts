import path from 'path';
import 'reflect-metadata';
import { Connection, createConnection, ConnectionOptions } from 'typeorm';

export type Mode = 'test' | 'normal';

export class Database {
  public static connection: Connection;

  public static async load(mode: Mode = 'normal'): Promise<void> {
    console.log(__dirname + '/entity/*.js');
    const connection = await createConnection({
      type: 'sqlite',
      database: path.join(__dirname, '../../data.db'),
      entities: [__dirname + '/entity/*.js'],
      synchronize: true,
      logging: mode === 'test',
    } as ConnectionOptions);
    if (connection) Database.connection = connection;
  }

  public static getConnection(): Connection {
    return Database.connection;
  }
}
