import { BatchRegisterer } from './../../utils/BatchRegisterer';
import { Scheduler } from './Scheduler';

export abstract class SchedulerBatchRegisterer implements BatchRegisterer<Scheduler> {
  abstract get(): Scheduler[];
}
