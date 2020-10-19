import { Command } from './Command';
import { CommandEvent } from './CommandEvent';

export class CommandManager {
  private commands: Command[] = [];

  constructor() {
    CommandEvent.load();
  }

  public getCommand(command: string): Command {
    return this.commands.find((cmd) => cmd.aliases.includes(command), null);
  }

  public getCommandWithName(commandName: string): Command {
    return this.commands.find((cmd) => cmd.name === commandName, null);
  }

  public register(command: Command): void {
    if (!this.getCommandWithName(command.name)) this.commands.push(command);
  }

  public registerAll(...commands: Command[]): void {
    commands.forEach((command) => this.register(command));
  }

  public unregister(command: Command): void {
    this.commands = this.commands.filter((cmd) => cmd.name !== command.name);
  }

  public unregisterWithAliases(commandAliases: string): void {
    this.commands = this.commands.filter((cmd) => !cmd.aliases.includes(commandAliases));
  }

  public unregisterWithName(commandName: string): void {
    this.commands = this.commands.filter((cmd) => cmd.name !== commandName);
  }
}
