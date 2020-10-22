import { Scheduler } from './Scheduler';
import { SchedulerBatchRegisterer } from './SchedulerBatchRegisterer';
import { SchedulerRegisterer } from './SchedulerRegisterer';
export class SchedulerManager {
  private schedulers: Scheduler[] = [];

  public getScheduler(schedulerName: string): Scheduler {
    return this.schedulers.find((scheduler) => scheduler.name === schedulerName, null);
  }

  public register(scheduler: Scheduler): void {
    if (!this.getScheduler(scheduler.name)) {
      this.schedulers.push(scheduler);
      scheduler.register();
    }
  }

  public registerClass(schedulerRegisterer: SchedulerRegisterer): void {
    const scheduler = schedulerRegisterer.get();
    if (!this.getScheduler(scheduler.name)) {
      this.schedulers.push(scheduler);
      scheduler.register();
    }
  }

  public registerBatchClass(schedulerBatchRegisterer: SchedulerBatchRegisterer): void {
    schedulerBatchRegisterer.get().forEach((scheduler) => {
      this.register(scheduler);
    });
  }

  public registerAll(...schedulers: Scheduler[]): void {
    schedulers.forEach((scheduler) => this.register(scheduler));
  }

  public registerAllClass(...schedulerRegisterers: SchedulerRegisterer[]): void {
    schedulerRegisterers.forEach((schedulerRegisterer) => {
      this.registerClass(schedulerRegisterer);
    });
  }

  public unregister(scheduler: Scheduler): void {
    const sch = this.getScheduler(scheduler.name);
    if (sch) sch.unregister();
    this.schedulers = this.schedulers.filter((sch) => sch.name !== scheduler.name);
  }

  public unregisterWithName(schedulerName: string): void {
    const sch = this.getScheduler(schedulerName);
    if (sch) sch.unregister();
    this.schedulers = this.schedulers.filter((sch) => sch.name !== schedulerName);
  }
}
