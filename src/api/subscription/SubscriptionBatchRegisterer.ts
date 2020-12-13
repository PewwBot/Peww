import { BatchRegisterer } from './../../utils/BatchRegisterer';
import { Subscription } from './Subscription';

export abstract class SubscriptionBatchRegisterer implements BatchRegisterer<Subscription<any>> {
  abstract get(): Subscription<any>[];
}
