import { PewwBot } from '../../../PewwBot';
import { Argument } from './Argument';
import * as fs from 'fs';
import * as path from 'path';
import { ArgumentBatchRegisterer } from './ArgumentBatchRegisterer';
import { ArgumentRegisterer } from './ArgumentRegisterer';

export class ArgumentManager {
  private bot: PewwBot;
  private arguments: Map<string, Argument<any>> = new Map();

  constructor(bot: PewwBot) {
    this.bot = bot;
  }

  public getCount(): number {
    return this.arguments.size;
  }

  public get<T>(name: string): Argument<T> | undefined {
    if (!this.arguments.has(name)) return null;
    return this.arguments.get(name);
  }

  public register<T>(argument: Argument<T>): void {
    argument.bot = this.bot;
    if (!this.get(argument.name)) {
      try {
        argument.init();
        this.arguments.set(argument.name, argument);
      } catch (error) {
        this.bot.getLogger().error(`${argument.name} argument could not be loaded!`);
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
        const argumentClazzRequire = await import(filePath);
        const argumentClazz = argumentClazzRequire.default
          ? argumentClazzRequire.default
          : argumentClazzRequire[Object.keys(argumentClazzRequire)[0]];
        if (!argumentClazz) continue;
        const clazzObject = new argumentClazz();
        if (!clazzObject) continue;
        if (clazzObject instanceof ArgumentBatchRegisterer) {
          this.registerBatchClass(clazzObject);
        } else if (clazzObject instanceof ArgumentRegisterer) {
          this.registerClass(clazzObject);
        } else {
          this.register(clazzObject as Argument<any>);
          for (const clazzObject of Object.keys(argumentClazzRequire).splice(1)) {
            const argumentClazz = argumentClazzRequire[clazzObject];
            if (!argumentClazz) continue;
            this.register(new argumentClazz() as Argument<any>);
          }
        }
      }
    }
  }

  public registerClass<T>(argumentRegisterer: ArgumentRegisterer<T>): void {
    const argument = argumentRegisterer.get();
    this.register(argument);
  }

  public registerBatchClass(argumentBatchRegisterer: ArgumentBatchRegisterer): void {
    argumentBatchRegisterer.get().forEach((argument) => {
      this.register(argument);
    });
  }

  public registerAll(...args: Argument<any>[]): void {
    args.forEach((argument) => this.register(argument));
  }

  public registerAllClass(...argumentRegisterers: ArgumentRegisterer<any>[]): void {
    argumentRegisterers.forEach((argumentRegisterer) => {
      this.registerClass(argumentRegisterer);
    });
  }

  public registerAllBatchClass(...argumentBatchRegisterers: ArgumentBatchRegisterer[]): void {
    argumentBatchRegisterers.forEach((argumentBatchRegisterer) => {
      this.registerBatchClass(argumentBatchRegisterer);
    });
  }

  public unregister(argument: Argument<any>): void {
    if (!this.arguments.has(argument.name)) return;
    this.arguments.delete(argument.name);
  }

  public unregisterWithName(argumentName: string): void {
    if (!this.arguments.has(argumentName)) return;
    this.arguments.delete(argumentName);
  }
}
