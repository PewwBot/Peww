import { Worker, fork } from 'cluster';
import { EventEmitter } from 'events';
import { IPCError, IPCResult } from '../ShardClientUtil';
import { ShardingManager } from '../ShardingManager';
import { Util as DjsUtil } from 'discord.js';
import { IPCEvents } from '../ShardConstants';
import { Util } from '../../../utils/Util';

export interface ClusterOptions {
  id: number;
  shards: number[];
  manager: ShardingManager;
}

export class Cluster extends EventEmitter {
  public ready = false;
  public id: number;
  public shards: number[];
  public worker?: Worker;
  public manager: ShardingManager;

  private readonly _exitListenerFunction: (...args: any[]) => void;

  constructor(options: ClusterOptions) {
    super();
    this.id = options.id;
    this.shards = options.shards;
    this.manager = options.manager;
    this._exitListenerFunction = this._exitListener.bind(this);

    this.once('ready', () => {
      this.ready = true;
    });
  }

  // tslint:disable-next-line: ban-types
  public async eval(script: string | Function) {
    script = typeof script === 'function' ? `(${script})(this)` : script;
    const { success, d } = (await this.manager.ipc.server.sendTo(`Cluster ${this.id}`, {
      op: IPCEvents.EVAL,
      d: script,
    })) as IPCResult;
    if (!success) throw DjsUtil.makeError(d as IPCError);
    return d;
  }

  public async fetchClientValue(prop: string) {
    const { success, d } = (await this.manager.ipc.server.sendTo(`Cluster ${this.id}`, {
      op: IPCEvents.EVAL,
      d: `this.${prop}`,
    })) as IPCResult;
    if (!success) throw DjsUtil.makeError(d as IPCError);
    return d;
  }

  public kill() {
    if (this.worker) {
      this.manager.emit('debug', `Killing Cluster ${this.id}`);
      this.worker.removeListener('exit', this._exitListenerFunction);
      this.worker.kill();
    }
  }

  public async respawn(delay = 500) {
    this.kill();
    if (delay) await DjsUtil.delayFor(delay);
    await this.spawn();
  }

  public send(data: object) {
    return this.manager.ipc.node.sendTo(`Cluster ${this.id}`, data);
  }

  public async spawn() {
    this.worker = fork({
      CLUSTER_SHARDS: this.shards.join(','),
      CLUSTER_ID: this.id.toString(),
      CLUSTER_SHARD_COUNT: this.manager.shardCount.toString(),
      CLUSTER_CLUSTER_COUNT: this.manager.clusterCount.toString(),
    });

    this.worker.once('exit', this._exitListenerFunction);

    this.manager.emit('debug', `Worker spawned with id ${this.worker.id}`);

    this.manager.emit('spawn', this);

    await this._waitReady(this.shards.length);
    await Util.sleep(5000);
  }

  private _exitListener(code: number, signal: string) {
    this.ready = false;
    this.worker = undefined;

    if (this.manager.respawn) this.respawn();

    this.manager.emit(
      'debug',
      `Worker exited with code ${code} and signal ${signal}${this.manager.respawn ? ', restarting...' : ''}`
    );
  }

  private _waitReady(shardCount: number) {
    return new Promise((resolve, reject) => {
      this.once('ready', resolve);
      setTimeout(
        () => reject(new Error(`Cluster ${this.id} took too long to get ready`)),
        this.manager.timeout * shardCount * (this.manager.guildsPerShard / 1000)
      );
    });
  }
}
