export type PredicateType<T> = (x: T) => boolean;

export class Predicate<T> {
  constructor(private condition: PredicateType<T>) {}

  private static isInstance = <T>(input: Predicate<T> | PredicateType<T>): Predicate<T> =>
    input instanceof Predicate ? input : Predicate.of(input);

  public static of = <T>(condition: PredicateType<T>) => new Predicate(condition);

  public and = (input: Predicate<T> | PredicateType<T>): Predicate<T> =>
    Predicate.of((x: T) => this.apply(x) && Predicate.isInstance(input).apply(x));

  public or = (input: Predicate<T> | PredicateType<T>): Predicate<T> =>
    Predicate.of((x: T) => this.apply(x) || Predicate.isInstance(input).apply(x));

  public not = (): Predicate<T> => Predicate.of((x: T) => !this.apply(x));

  public apply = (x: T): boolean => this.condition(x);
}
