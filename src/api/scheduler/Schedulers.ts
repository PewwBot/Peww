import * as Discord from 'discord.js';
import { SchedulerBuilder } from './SchedulerBuilder';

export class Schedulers {
  public static create(name: string): SchedulerBuilder {
    return SchedulerBuilder.newBuilder(name);
  }
}
