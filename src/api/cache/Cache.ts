export class Cache<T> {
  private data: Map<string, T> = new Map();

  public getData(): Map<string, T> {
    return this.data;
  }

}