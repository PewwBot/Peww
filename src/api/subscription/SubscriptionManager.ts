import * as Discord from 'discord.js';
import { Subscription } from './Subscription';
import { SubscriptionBatchRegisterer } from './SubscriptionBatchRegisterer';
import { SubscriptionRegisterer } from './SubscriptionRegisterer';
export class SubscriptionManager {
  private subscriptions: Subscription<any>[] = [];

  public getSubscription<K extends keyof Discord.ClientEvents>(subscriptionName: string): Subscription<K> {
    return this.subscriptions.find((subscription) => subscription.name === subscriptionName, null);
  }

  public register<K extends keyof Discord.ClientEvents>(subscription: Subscription<K>): void {
    if (!this.getSubscription(subscription.name)) {
      this.subscriptions.push(subscription);
      subscription.register();
    }
  }

  public registerClass<K extends keyof Discord.ClientEvents>(subscriptionRegisterer: SubscriptionRegisterer<K>): void {
    const subscription = subscriptionRegisterer.get();
    if (!this.getSubscription(subscription.name)) {
      this.subscriptions.push(subscription);
      subscription.register();
    }
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
