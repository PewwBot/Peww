export class CommandCategory {
  public static readonly NONE = new CommandCategory('NONE');

  private name: string;

  constructor(name: string) {
    this.name = name;
  }

  public getName(): string {
    return this.name;
  }
}