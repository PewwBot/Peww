export class SettingMode {
  private name: string;
  private aliases: string[];
  private helpMessage?: string;

  constructor(name: string, aliases: string[], helpMessage?: string) {
    this.name = name;
    this.aliases = aliases;
    if (helpMessage) this.helpMessage = helpMessage;
  }

  public static of(name: string, aliases: string[], helpMessage?: string) {
    return new SettingMode(name, aliases, helpMessage);
  }

  public getName(): string {
    return this.name;
  }

  public getAliases(): string[] {
    return this.aliases;
  }

  public getHelpMessage(): string {
    return this.helpMessage;
  }
}
