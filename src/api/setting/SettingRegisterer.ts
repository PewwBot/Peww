import { Setting } from './Setting';
import { Registerer } from './../../utils/Registerer';

export abstract class SettingRegisterer<T, V> implements Registerer<Setting<T, V>> {
  abstract get(): Setting<T, V>;
}
