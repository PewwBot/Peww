import { Registerer } from './../../utils/Registerer';
import { Scheduler } from './Scheduler';

export abstract class SchedulerRegisterer implements Registerer<Scheduler> {
  abstract get(): Scheduler;
}
