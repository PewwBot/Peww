export interface Requirement<T> {

  control(x: T): boolean;

}