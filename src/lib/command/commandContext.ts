import { Message } from "discord.js";
import { PewwClient } from "../../client";
import { CommandContext } from "../../types";
import { Command } from "./command";

export class ImmutableCommandContext implements CommandContext {
  private readonly _client: PewwClient;
  private readonly _message: Message;
  private readonly _command: Command;
  private readonly _label: string;
  private readonly _prefix: string;
  private readonly _args: string[];

  constructor(client: PewwClient, message: Message, command: Command, label: string, prefix: string, args: string[]) {
    this._client = client;
    this._message = message;
    this._command = command;
    this._label = label;
    this._prefix = prefix;
    this._args = args;
  }

  get client(): PewwClient {
    return this._client;
  }
  get message(): Message {
    return this._message;
  }
  get command(): Command {
    return this._command;
  }
  get label(): string {
    return this._label;
  }
  get prefix(): string {
    return this._prefix;
  }
  get organizedPrefix(): string {
    return this.prefix.startsWith('<@!') ? this._client.settings.prefix[0] : this.prefix;
  }
  reply(...messages: string[]): void {
    this.message.channel.send(messages.join('\n'));
  }
  get args(): string[] {
    return this._args;
  }
  get immutableArgs(): string[] {
    return Object.assign([], this.args);
  }
  copy(newLabel?: string, newArgs?: string[]): CommandContext {
    const newContext = new ImmutableCommandContext(
      this.client,
      this.message,
      this.command,
      newLabel ? newLabel : this.label,
      this.prefix,
      newArgs ? newArgs : this.args
    );
    return newContext;
  }



}