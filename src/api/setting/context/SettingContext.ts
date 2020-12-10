import { PewwBot } from '../../../PewwBot';
import { SettingMode } from '../SettingMode';

export interface SettingContext<T, V> {
  getBot(): PewwBot;

  getType(): T;

  getValue(): V;

  getMode(): SettingMode;

  getCurrentModeArgs(): string[];
}
