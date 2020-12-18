import * as Discord from 'discord.js';
import { AbstractArgument } from '../api/command/argument/AbstractArgument';
import { CommandContext } from '../api/command/context/CommandContext';

export class MemberArgument extends AbstractArgument<Discord.GuildMember> {
  constructor() {
    super({
      name: 'member',
    });
  }

  init(): void {
    this.setupOptions({
      regex: undefined,
      shift: false,
    });
  }

  async to(context: CommandContext, _controlledArg: string | undefined): Promise<Discord.GuildMember> {
    return context.getMessage().member;
  }
}
