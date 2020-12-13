import { Scheduler } from './Scheduler';
import { Registerer } from './../../utils/Registerer';

export abstract class SchedulerRegisterer implements Registerer<Scheduler> {
  abstract get(): Scheduler;
}
