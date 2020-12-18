import * as fs from 'fs';
import * as path from 'path';
import { PewwBot } from '../../PewwBot';
import { Scheduler } from './Scheduler';
import { SchedulerBatchRegisterer } from './SchedulerBatchRegisterer';
import { SchedulerRegisterer } from './SchedulerRegisterer';

export class SchedulerManager {
  private bot: PewwBot;
  private schedulers: Scheduler[] = [];

  constructor(bot: PewwBot) {
    this.bot = bot;
  }

  public getCount(): number {
    return this.schedulers.length;
  }

  public getScheduler(schedulerName: string): Scheduler {
    return this.schedulers.find((scheduler) => scheduler.name === schedulerName, null);
  }

  public register(scheduler: Scheduler): void {
    scheduler.bot = this.bot;
    if (!this.getScheduler(scheduler.name)) {
      try {
        scheduler.init();
        this.schedulers.push(scheduler);
        scheduler.start();
      } catch (error) {
        this.bot.getLogger().error(`${scheduler.name} scheduler could not be loaded!`);
      }
    }
  }

  public async registerPath(_path: string): Promise<void> {
    const files = await fs.readdirSync(_path);
    for (const file of files) {
      const filePath = path.join(_path, file);
      if ((await fs.statSync(filePath)).isDirectory()) {
        await this.registerPath(filePath);
      } else {
        const schedulerClazzRequire = await import(filePath);
        const schedulerClazz = schedulerClazzRequire.default ? schedulerClazzRequire.default : schedulerClazzRequire[Object.keys(schedulerClazzRequire)[0]];
        if (!schedulerClazz) continue;
        const clazzObject = new schedulerClazz();
        if (!clazzObject) continue;
        if (clazzObject instanceof SchedulerBatchRegisterer) {
          this.registerBatchClass(clazzObject);
        } else if (clazzObject instanceof SchedulerRegisterer) {
          this.registerClass(clazzObject);
        } else {
          this.register(clazzObject as Scheduler);
          for (const clazzObject of Object.keys(schedulerClazzRequire).splice(1)) {
            const schedulerClazz = schedulerClazzRequire[clazzObject];
            if (!schedulerClazz) continue;
            this.register(new schedulerClazz() as Scheduler);
          }
        }
      }
    }
  }

  public registerClass(schedulerRegisterer: SchedulerRegisterer): void {
    const scheduler = schedulerRegisterer.get();
    this.register(scheduler);
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

  public registerAllBatchClass(...schedulerBatchRegisterers: SchedulerBatchRegisterer[]): void {
    schedulerBatchRegisterers.forEach((schedulerBatchRegisterer) => {
      this.registerBatchClass(schedulerBatchRegisterer);
    });
  }

  public unregister(scheduler: Scheduler): void {
    const sch = this.getScheduler(scheduler.name);
    if (sch) sch.stop();
    this.schedulers = this.schedulers.filter((sch) => sch.name !== scheduler.name);
  }

  public unregisterWithName(schedulerName: string): void {
    const sch = this.getScheduler(schedulerName);
    if (sch) sch.stop();
    this.schedulers = this.schedulers.filter((sch) => sch.name !== schedulerName);
  }
}
