import { AbstractArgument } from '../api/command/argument/AbstractArgument';
import { CommandContext } from '../api/command/context/CommandContext';
import * as Discord from 'discord.js';

export class GuildArgument extends AbstractArgument<Discord.Guild> {
  constructor() {
    super({
      name: 'guild',
    });
  }

  init(): void {
    this.setupOptions({
      regex: undefined,
      shift: false,
    });
  }

  async to(context: CommandContext, _controlledArg: string | undefined): Promise<Discord.Guild> {
    return context.getMessage().guild;
  }
}
