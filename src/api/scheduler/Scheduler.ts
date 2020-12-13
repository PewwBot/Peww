import { PewwBot } from '../../PewwBot';

export interface Scheduler {
  bot: PewwBot;
  name: string;
  active: boolean;
  ms: number;

  init(): void;

  start(): void;

  stop(): void;

  register(): void;

  unregister(): void;

  call(): void;

  run(): void;

  isActive(): boolean;
}