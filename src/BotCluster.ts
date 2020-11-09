import { BaseCluster } from './api/shard/cluster/BaseCluster';

export default class BotCluster extends BaseCluster {
  launch(): void | Promise<void> {
    this.client.login('');
  }
}
