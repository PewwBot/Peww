import * as Discord from 'discord.js';
import { PewwBot } from '../../PewwBot';
import { Subscription } from './Subscription';
import { SubscriptionBatchRegisterer } from './SubscriptionBatchRegisterer';
import { SubscriptionRegisterer } from './SubscriptionRegisterer';
import * as fs from 'fs';
import * as path from 'path';
export class SubscriptionManager {
  private bot: PewwBot;
  private subscriptions: Subscription<any>[] = [];

  constructor(bot: PewwBot) {
    this.bot = bot;
  }

  public getCount(): number {
    return this.subscriptions.length;
  }

  public getSubscription<K extends keyof Discord.ClientEvents>(subscriptionName: string): Subscription<K> {
    return this.subscriptions.find((subscription) => subscription.name === subscriptionName, null);
  }

  public register<K extends keyof Discord.ClientEvents>(subscription: Subscription<K>): void {
    subscription.bot = this.bot;
    if (!this.getSubscription(subscription.name)) {
      this.subscriptions.push(subscription);
      subscription.register();
      subscription.init();
    }
  }

  public async registerPath(_path: string): Promise<void> {
    const files = await fs.readdirSync(_path);
    for (const file of files) {
      const filePath = path.join(_path, file);
      if ((await fs.statSync(filePath)).isDirectory()) {
        await this.registerPath(filePath);
      } else {
        const subscriptionClazzRequire = await import(filePath);
        const subscriptionClazz = subscriptionClazzRequire.default ? subscriptionClazzRequire.default : subscriptionClazzRequire[Object.keys(subscriptionClazzRequire)[0]];
        if (!subscriptionClazz) continue;
        const clazzObject = new subscriptionClazz();
        if (!clazzObject) continue;
        if (clazzObject instanceof SubscriptionBatchRegisterer) {
          this.registerBatchClass(clazzObject);
        } else if (clazzObject instanceof SubscriptionRegisterer) {
          this.registerClass(clazzObject);
        } else {
          this.register(clazzObject as Subscription<any>);
          for (const clazzObject of Object.keys(subscriptionClazzRequire).splice(1)) {
            const subscriptionClazz = subscriptionClazzRequire[clazzObject];
            if (!subscriptionClazz) continue;
            this.register(new subscriptionClazz() as Subscription<any>);
          }
        }
      }
    }
  }

  public registerClass<K extends keyof Discord.ClientEvents>(subscriptionRegisterer: SubscriptionRegisterer<K>): void {
    const subscription = subscriptionRegisterer.get();
    this.register(subscription);
  }

  public registerBatchClass(subscriptionBatchRegisterer: SubscriptionBatchRegisterer): void {
    subscriptionBatchRegisterer.get().forEach((subscription) => {
      this.register(subscription);
    });
  }

  public registerAll(...subscriptions: Subscription<any>[]): void {
    subscriptions.forEach((subscription) => this.register(subscription));
  }

  public registerAllClass(...subscriptionRegisterers: SubscriptionRegisterer<any>[]): void {
    subscriptionRegisterers.forEach((subscriptionRegisterer) => {
      this.registerClass(subscriptionRegisterer);
    });
  }

  public registerAllBatchClass(...subscriptionBatchRegisterers: SubscriptionBatchRegisterer[]): void {
    subscriptionBatchRegisterers.forEach((subscriptionBatchRegisterer) => {
      this.registerBatchClass(subscriptionBatchRegisterer);
    });
  }

  public unregister(subscription: Subscription<any>): void {
    const sub = this.getSubscription(subscription.name);
    if (sub) sub.unregister();
    this.subscriptions = this.subscriptions.filter((sub) => sub.name !== subscription.name);
  }

  public unregisterWithName(subscriptionName: string): void {
    const sub = this.getSubscription(subscriptionName);
    if (sub) sub.unregister();
    this.subscriptions = this.subscriptions.filter((sub) => sub.name !== subscriptionName);
  }
}
