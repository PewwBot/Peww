import { Setting } from './Setting';
import { BatchRegisterer } from './../../utils/BatchRegisterer';

export interface SettingBatchRegisterer extends BatchRegisterer<Setting<any, any>> {}
