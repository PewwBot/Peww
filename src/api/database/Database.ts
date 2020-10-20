import { GuildEntity } from './entity/GuildEntity';
import 'reflect-metadata';
import { Connection, createConnection, ConnectionOptions } from 'typeorm';
import { Bot } from '../../Bot';

export class Database {
  private connection: Connection;

  public load(callback: (error: Error) => void) {
    createConnection({
      type: 'mariadb',
      host: '',
      port: 0,
      username: '',
      password: '',
      database: '',
      entities: [
        __dirname + '/api/database/entity/*.js'
      ],
      synchronize: true,
      logging: false
    } as ConnectionOptions).then((connection: Connection) => {
      this.connection = connection;
      callback(null);
    }).catch((error: Error) => {
      callback(error);
    });
  }

}