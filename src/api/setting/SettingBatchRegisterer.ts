import { Setting } from './Setting';
import { BatchRegisterer } from './../../utils/BatchRegisterer';

export abstract class SettingBatchRegisterer implements BatchRegisterer<Setting<any, any>> {
  abstract get(): Setting<any, any>[];
}
