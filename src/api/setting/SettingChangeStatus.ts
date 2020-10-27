export class SettingChangeStatus<T> {

  private data: T | undefined;

  constructor(data?: T) {
    if (data) this.data = data;
  }

  public static of<V>(data?: V): SettingChangeStatus<V> {
    return new SettingChangeStatus(data);
  }

  public getData(): T {
    return this.data;
  }

  public isSuccessfully(): boolean {
    return this.data != null;
  }

}