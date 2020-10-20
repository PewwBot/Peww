import * as Discord from 'discord.js';

export interface Subscription<K extends keyof Discord.ClientEvents> {
  event: K;
  name: string;
  active: boolean;
  callCounter: number;

  register(): void;

  unregister(): void;

  isActive(): boolean;

  getCallCounter(): number;
}