import { Bot } from './../../Bot';
import { CommandSubscription } from '../../subscriptions/CommandSubscription';
import { Command } from './Command';
import { CommandRegisterer } from './CommandRegisterer';
import { CommandBatchRegisterer } from './CommandBatchRegisterer';

export class CommandManager {
  private commands: Command[] = [];

  constructor() {
    Bot.getInstance().getSubscriptionManager().registerClass(new CommandSubscription());
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

  public registerClass(commandRegisterer: CommandRegisterer): void {
    const command = commandRegisterer.get();
    if (!this.getCommandWithName(command.name)) this.commands.push(command);
  }

  public registerBatchClass(commandBatchRegisterer: CommandBatchRegisterer): void {
    commandBatchRegisterer.get().forEach((command) => {
      this.register(command);
    });
  }

  public registerAll(...commands: Command[]): void {
    commands.forEach((command) => this.register(command));
  }

  public registerAllClass(...commandRegisterers: CommandRegisterer[]): void {
    commandRegisterers.forEach((commandRegisterer) => {
      this.registerClass(commandRegisterer);
    });
  }

  public registerAllBatchClass(...commandBatchRegisterers: CommandBatchRegisterer[]): void {
    commandBatchRegisterers.forEach((commandBatchRegisterer) => {
      this.registerBatchClass(commandBatchRegisterer);
    });
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
