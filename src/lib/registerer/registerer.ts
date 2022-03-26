export interface Registerer<T> {
  get(): T;
}

export interface BatchRegisterer<T> {
  get(): T[];
}