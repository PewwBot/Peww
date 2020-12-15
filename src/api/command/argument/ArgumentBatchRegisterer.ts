import { BatchRegisterer } from '../../../utils/BatchRegisterer';
import { Argument } from './Argument';

export abstract class ArgumentBatchRegisterer implements BatchRegisterer<Argument<any>> {
  abstract get(): Argument<any>[];
}
