import { Scheduler } from './Scheduler';
import { SchedulerImpl } from './SchedulerImpl';

import moment from 'moment';

export class SchedulerBuilder {
  private data: {
    name?: string;
    ms?: number;
  } = {};

  constructor(name: string) {
    this.data.name = name;
  }

  public static newBuilder(name: string): SchedulerBuilder {
    return new SchedulerBuilder(name);
  }

  public name(name: string): SchedulerBuilder {
    this.data.name = name;
    return this;
  }

  public ms(ms: number): SchedulerBuilder {
    this.data.ms = ms;
    return this;
  }

  public msMoment(ms: moment.Duration): SchedulerBuilder {
    this.data.ms = ms.asMilliseconds();
    return this;
  }

  public handler(handler: () => void): Scheduler {
    return new SchedulerImpl(this.data.name, this.data.ms, handler);
  }
}
