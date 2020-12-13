import { PewwBot } from '../../PewwBot';

export interface Scheduler {
  bot: PewwBot;
  uniqueId: string;
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