import path from 'path';
import fs from 'fs';
import { Service } from 'typedi';
import { Command } from './lib/command/command';
import { CommandError } from './lib/command/commandError';
import { Logger } from './utils/logger';
import { CommandBatchRegisterer, CommandRegisterer } from './lib/command/commandRegisterer';

@Service()
export class Management {
  constructor(public commandManager: CommandManager) { }
}

@Service()
export class CommandManager {
  private commands: Command[] = [];

  public get count(): number {
    return this.commands.length;
  }

  public get(command: string): Command {
    return this.commands.find((cmd) => cmd.config.aliases.includes(command), null);
  }

  public getWithName(commandName: string): Command {
    return this.commands.find((cmd) => cmd.config.name === commandName, null);
  }

  public register(command: Command): void {
    if (!this.getWithName(command.config.name)) {
      try {
        command.init();
        this.commands.push(command);
      } catch (error) {
        Logger.error(`${command.config.name} command could not be loaded!${error instanceof CommandError ? ` ${error.message}` : ''}`);
      }
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
    this.commands = this.commands.filter((cmd) => cmd.config.name !== command.config.name);
  }

  public unregisterWithAliases(commandAliases: string): void {
    this.commands = this.commands.filter((cmd) => !cmd.config.aliases.includes(commandAliases));
  }

  public unregisterWithName(commandName: string): void {
    this.commands = this.commands.filter((cmd) => cmd.config.name !== commandName);
  }

}
