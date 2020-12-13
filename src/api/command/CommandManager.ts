import { PewwBot } from '../../PewwBot';
import { CommandSubscription } from './CommandSubscription';
import { Command } from './Command';
import { CommandRegisterer } from './CommandRegisterer';
import { CommandBatchRegisterer } from './CommandBatchRegisterer';
import * as fs from 'fs';
import * as path from 'path';
import { AbstractCommand } from './AbstractCommand';

export class CommandManager {
  private bot: PewwBot;
  private commands: Command[] = [];

  constructor(bot: PewwBot) {
    this.bot = bot;
    this.bot.getSubscriptionManager().registerClass(new CommandSubscription(this.bot));
  }

  public getCount(): number {
    return this.commands.length;
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

  public async registerPath(_path: string): Promise<void> {
    const files = await fs.readdirSync(_path);
    for (const file of files) {
      const filePath = path.join(_path, file);
      if ((await fs.statSync(filePath)).isDirectory()) {
        await this.registerPath(filePath);
      } else {
        const commandClazzRequire = await import(filePath);
        const commandClazz = commandClazzRequire.default ? commandClazzRequire.default : commandClazzRequire[Object.keys(commandClazzRequire)[0]];
        if (!commandClazz) continue;
        const clazzObject = new commandClazz();
        if (!clazzObject) continue;
        if (clazzObject instanceof CommandBatchRegisterer) {
          this.registerBatchClass(clazzObject);
        } else if (clazzObject instanceof CommandRegisterer) {
          this.registerClass(clazzObject);
        } else {
          this.register(clazzObject as Command);
          for (const clazzObject of Object.keys(commandClazzRequire).splice(1)) {
            const commandClazz = commandClazzRequire[clazzObject];
            if (!commandClazz) continue;
            this.register(new commandClazz() as Command);
          }
        }
      }
    }
  }

  public registerClass(commandRegisterer: CommandRegisterer): void {
    const command = commandRegisterer.get();
    this.register(command);
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
