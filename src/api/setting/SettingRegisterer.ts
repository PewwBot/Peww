import { Registerer } from './../../utils/Registerer';
import { Setting } from './Setting';

export abstract class SettingRegisterer<T, V> implements Registerer<Setting<T, V>> {
  abstract get(): Setting<T, V>;
}
