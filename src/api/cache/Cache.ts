export class Cache<T> {
  private data: Map<string, T> = new Map();

  public static of<T>(): Cache<T> {
    return new Cache<T>();
  }

  public getData(): Map<string, T> {
    return this.data;
  }

}