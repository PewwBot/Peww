import { BatchRegisterer } from './../../utils/BatchRegisterer';
import { Setting } from './Setting';

export abstract class SettingBatchRegisterer implements BatchRegisterer<Setting<any, any>> {
  abstract get(): Setting<any, any>[];
}
