import { PewwBot } from '../../PewwBot';
import { Scheduler } from './Scheduler';
import moment from 'moment';
export abstract class AbstractScheduler implements Scheduler {
  bot: PewwBot;
  name: string;
  active: boolean;
  ms: number;

  private process: NodeJS.Timeout;

  constructor(args: { name?: string; ms?: number | moment.Duration }) {
    if (args.name) this.name = args.name;
    if (args.ms) {
      if ((args.ms as moment.Duration).asMilliseconds) {
        this.ms = (args.ms as moment.Duration).asMilliseconds();
      } else {
        this.ms = args.ms as number;
      }
    }
  }

  abstract init(): void;

  start(): void {
    this.process = setInterval(this.call, this.ms);
  }

  stop(): void {
    clearInterval(this.process);
  }

  register(): void {
    this.bot.getSchedulerManager().register(this);
  }
  unregister(): void {
    this.bot.getSchedulerManager().unregister(this);
  }

  call(): void {
    this.run();
  }

  abstract run(): void;

  isActive(): boolean {
    return this.active;
  }
}
