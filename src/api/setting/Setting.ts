export interface Setting<T, V> {

  name: string;

  change(t: T, v: V): void;

}