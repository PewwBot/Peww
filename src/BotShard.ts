import { ShardingManager } from './api/shard/ShardingManager';
import * as path from 'path';
import { SharderEvents } from './api/shard/ShardConstants';
import { Client, GuildManager } from 'discord.js';
import { BaseCluster } from './api/shard/cluster/BaseCluster';
import { ShardClientUtil } from './api/shard/ShardClientUtil';

export class BotShard {
  public static shardingManager: ShardingManager;

  public static async start() {
    this.shardingManager = new ShardingManager(path.join(__dirname, 'BotCluster'), {
      token: '',
    });
    this.shardingManager.on(SharderEvents.SPAWN, async (cluster) => {
      console.log(`Cluster Running! [${cluster.id}]`);
    });
    this.shardingManager.on(SharderEvents.DEBUG, (message) => {
      console.log(`Debugged: ${message}`);
    });
    this.shardingManager.on(SharderEvents.SHARD_READY, async (shardId) => {
      console.log(`Shard Ready! [${shardId}]`);
    });
    this.shardingManager.on(SharderEvents.SHARD_DISCONNECT, (event, shardId) => {
      console.log(`Shard Disconnected! [${shardId}] Reason: ${event.reason}`);
    });
    this.shardingManager.on(SharderEvents.SHARD_RECONNECT, (shardId) => {
      console.log(`Shard Reconnected! [${shardId}]`);
    });
    this.shardingManager.on(SharderEvents.SHARD_RESUME, (replayed, shardId) => {
      console.log(`Shard Resumed! [${shardId}] Replayed: ${replayed}`);
    });
    await this.shardingManager.spawn();
  }
}
