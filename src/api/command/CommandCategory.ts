export class CommandCategory {
  public static readonly MANAGEMENT = new CommandCategory('MANAGEMENT');
  public static readonly OWNER = new CommandCategory('OWNER');
  public static readonly SETTING = new CommandCategory('SETTING');
  public static readonly NONE = new CommandCategory('NONE');

  private name: string;

  constructor(name: string) {
    this.name = name;
  }

  public getName(): string {
    return this.name;
  }
}