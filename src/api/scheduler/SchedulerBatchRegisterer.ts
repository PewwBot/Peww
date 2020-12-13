import { Scheduler } from './Scheduler';
import { BatchRegisterer } from './../../utils/BatchRegisterer';

export abstract class SchedulerBatchRegisterer implements BatchRegisterer<Scheduler> {
  abstract get(): Scheduler[];
}
