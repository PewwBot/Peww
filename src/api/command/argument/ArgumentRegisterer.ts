import { Registerer } from '../../../utils/Registerer';
import { Argument } from './Argument';

export abstract class ArgumentRegisterer<T> implements Registerer<Argument<T>> {
  abstract get(): Argument<T>;
}
