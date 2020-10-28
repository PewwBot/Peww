export class SettingChangeStatus<T> {

  private data: T | undefined;
  private message: () => string;

  constructor(data?: T, message?: () => string) {
    if (data) this.data = data;
    if (message) this.message = message;
  }

  public static of<V>(data?: V, message?: () => string): SettingChangeStatus<V> {
    return new SettingChangeStatus(data, message);
  }

  public getData(): T {
    return this.data;
  }

  public getMessage(): string {
    if (!this.message) return null;
    return this.message();
  }

  public isSuccessfully(): boolean {
    return this.data != null;
  }

}