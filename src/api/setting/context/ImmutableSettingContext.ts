import { PewwBot } from '../../../PewwBot';
import { SettingMode } from '../SettingMode';
import { SettingContext } from './SettingContext';

export class ImmutableSettingContext<T, V> implements SettingContext<T, V> {
  private readonly bot: PewwBot;
  private readonly type: T;
  private readonly value: V;
  private readonly mode: SettingMode;
  private readonly currentModeArgs: string[];

  constructor(bot: PewwBot, type: T, value: V, mode: SettingMode, currentModeArgs: string[]) {
    this.bot = bot;
    this.type = type;
    this.value = value;
    this.mode = mode;
    this.currentModeArgs = currentModeArgs;
  }

  getBot(): PewwBot {
    return this.bot;
  }

  getType(): T {
    return this.type;
  }

  getValue(): V {
    return this.value;
  }

  getMode(): SettingMode {
    return this.mode;
  }

  getCurrentModeArgs(): string[] {
    return this.currentModeArgs;
  }
}
