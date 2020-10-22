export interface Scheduler {
  name: string;
  active: boolean;
  ms: number;

  register(): void;

  unregister(): void;

  isActive(): boolean;
}