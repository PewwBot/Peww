import { AbstractArgument } from '../api/command/argument/AbstractArgument';

import * as Discord from 'discord.js';
import { CommandContext } from '../api/command/context/CommandContext';

export class ChannelArgument extends AbstractArgument<Discord.TextChannel | Discord.DMChannel | Discord.NewsChannel> {
  constructor() {
    super({
      name: 'channel',
    });
  }

  init(): void {
    this.setupOptions({
      regex: undefined,
      shift: false,
    });
  }

  async to(
    context: CommandContext,
    _controlledArg: string | undefined
  ): Promise<Discord.TextChannel | Discord.DMChannel | Discord.NewsChannel> {
    return context.getMessage().channel;
  }
}
