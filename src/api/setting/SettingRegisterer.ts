import { Setting } from './Setting';
import { Registerer } from './../../utils/Registerer';

export interface SettingRegisterer<T, V, M> extends Registerer<Setting<T, V, M>> {}
