import { BatchRegisterer } from './../../utils/BatchRegisterer';
import { Subscription } from './Subscription';

export interface SubscriptionBatchRegisterer extends BatchRegisterer<Subscription<any>> {}
