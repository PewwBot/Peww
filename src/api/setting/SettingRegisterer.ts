import { Setting } from './Setting';
import { Registerer } from './../../utils/Registerer';

export interface SettingRegisterer<T, V> extends Registerer<Setting<T, V>> {}
