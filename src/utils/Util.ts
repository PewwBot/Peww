import { Constructable } from 'discord.js';
import { promisify } from 'util';
import { BaseCluster } from '../api/shard/cluster/BaseCluster';
import { ShardingManager } from '../api/shard/ShardingManager';

export class Util {
  public static PRIMITIVE_TYPES: string[] = ['string', 'bigint', 'number', 'boolean'];

  public static chunk<T>(entries: T[], chunkSize: number): T[][] {
    const result: T[][] = [];
    const amount = Math.floor(entries.length / chunkSize);
    const mod = entries.length % chunkSize;

    for (let i = 0; i < chunkSize; i++) {
      result[i] = entries.splice(0, i < mod ? amount + 1 : amount);
    }

    return result;
  }

  public static deepClone(source: any): any {
    // Check if it's a primitive (with exception of function and null, which is typeof object)
    if (source === null || this.isPrimitive(source)) return source;

    if (Array.isArray(source)) {
      const output = [];
      for (const value of source) output.push(this.deepClone(value));
      return output;
    }

    if (this.isObject(source)) {
      const output = {} as Record<string, any>;
      for (const [key, value] of Object.entries(source)) output[key] = this.deepClone(value);
      return output;
    }

    if (source instanceof Map) {
      const output = new (source.constructor() as Constructable<Map<any, any>>)();
      for (const [key, value] of source.entries()) output.set(key, this.deepClone(value));
      return output;
    }

    if (source instanceof Set) {
      const output = new (source.constructor() as Constructable<Set<any>>)();
      for (const value of source.values()) output.add(this.deepClone(value));
      return output;
    }

    return source;
  }

  public static mergeDefault<T>(def: Record<string, any>, given: Record<string, any>): T {
    if (!given) return this.deepClone(def);
    for (const key in def) {
      if (given[key] === undefined) given[key] = this.deepClone(def[key]);
      else if (this.isObject(given[key])) given[key] = this.mergeDefault(def[key], given[key]);
    }

    return given as any;
  }

  public static isPrimitive(value: any): value is string | bigint | number | boolean {
    return this.PRIMITIVE_TYPES.includes(typeof value);
  }

  public static isObject(input: any) {
    return input && input.constructor === Object;
  }

  public static calculateShards(shards: number, guildsPerShard: number): number {
    return Math.ceil(shards * (1000 / guildsPerShard));
  }

  public static async startCluster(manager: ShardingManager) {
    const ClusterClassRequire = await import(manager.path);
    const ClusterClass = ClusterClassRequire.default ? ClusterClassRequire.default : ClusterClassRequire;
    const cluster = new ClusterClass(manager) as BaseCluster;
    return cluster.init();
  }

  public static sleep(duration: number) {
    return promisify(setTimeout)(duration);
  }
}
