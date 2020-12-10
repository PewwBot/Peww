import * as Discord from 'discord.js';
import { PewwBot } from '../../PewwBot';

export interface Subscription<K extends keyof Discord.ClientEvents> {
  event: K;
  name: string;
  active: boolean;
  callCounter: number;

  register(bot: PewwBot): void;

  unregister(bot: PewwBot): void;

  isActive(): boolean;

  getCallCounter(): number;
}