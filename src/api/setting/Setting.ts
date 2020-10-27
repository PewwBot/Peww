export interface Setting<T, V> {

  name: string;

  accept(t: T, v: V): void;

}