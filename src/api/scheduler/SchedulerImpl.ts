import { Scheduler } from './Scheduler';
export class SchedulerImpl implements Scheduler {
  name: string;
  active: boolean;
  ms: number;

  private process: NodeJS.Timeout;

  private readonly handler: () => void;

  constructor(name: string, ms: number, handler: () => void) {
    this.name = name;
    this.ms = ms;
    this.handler = handler;
  }

  register(): void {
    this.process = setInterval(this.handler, this.ms);
  }

  unregister(): void {
    clearInterval(this.process);
  }

  isActive(): boolean {
    return this.active;
  }
}
