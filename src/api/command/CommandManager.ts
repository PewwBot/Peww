import { PewwBot } from '../../PewwBot';
import { CommandSubscription } from './CommandSubscription';
import { Command } from './Command';
import { CommandRegisterer } from './CommandRegisterer';
import { CommandBatchRegisterer } from './CommandBatchRegisterer';

export class CommandManager {
  private bot: PewwBot;
  private commands: Command[] = [];

  constructor(bot: PewwBot) {
    this.bot = bot;
    this.bot.getSubscriptionManager().registerClass(new CommandSubscription(this.bot));
  }

  public getCommand(command: string): Command {
    return this.commands.find((cmd) => cmd.aliases.includes(command), null);
  }

  public getCommandWithName(commandName: string): Command {
    return this.commands.find((cmd) => cmd.name === commandName, null);
  }

  public register(command: Command): void {
    command.bot = this.bot;
    if (!this.getCommandWithName(command.name)) {
      this.commands.push(command);
      command.init();
    }
  }

  public registerClass(commandRegisterer: CommandRegisterer): void {
    const command = commandRegisterer.get();
    command.bot = this.bot;
    if (!this.getCommandWithName(command.name)) {
      this.commands.push(command);
      command.init();
    }
  }

  public registerBatchClass(commandBatchRegisterer: CommandBatchRegisterer): void {
    commandBatchRegisterer.get().forEach((command) => {
      command.bot = this.bot;
      this.register(command);
      command.init();
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
