import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import { PewwBot } from '../../PewwBot';
import { Scheduler } from './Scheduler';

export abstract class AbstractScheduler implements Scheduler {
  bot: PewwBot;
  uniqueId: string = uuidv4();
  name: string;
  active: boolean;
  ms: number;

  private process: NodeJS.Timeout;

  constructor(args: { name: string }) {
    this.name = args.name;
  }

  public setupOptions(args?: { ms?: number | moment.Duration }) {
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
