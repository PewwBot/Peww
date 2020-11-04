import { AbstractCommand } from '../AbstractCommand';
import { CommandCategory } from '../CommandCategory';
import { CommandContext } from '../context/CommandContext';
import { FunctionalCommandHandler } from './FunctionalCommandHandler';
import { Predicate } from '../../../utils/Predicate';
import { CommandPermission } from '../CommandPermission';
import { DMChannel, GuildChannel, NewsChannel, TextChannel } from 'discord.js';

export class FunctionalCommand extends AbstractCommand {
  private readonly predicates: Predicate<CommandContext>[];
  private readonly handler: FunctionalCommandHandler;

  constructor(
    name: string,
    description: string,
    category: CommandCategory,
    predicates: Predicate<CommandContext>[],
    handler: FunctionalCommandHandler,
    aliases?: string[],
    permission?: CommandPermission
  ) {
    super();
    this.name = name;
    this.description = description;
    this.category = category;
    this.predicates = predicates;
    this.handler = handler;
    this.aliases = aliases ? aliases : ['errorred'];
    if (permission) this.permission = permission;
  }

  public async call(context: CommandContext): Promise<void> {
    if (
      this.permission &&
      !await this.permission.test(
        context.getMessage().channel instanceof DMChannel ? context.getMessage().author : context.getMessage().member
      )
    )
      return;
    for (const predicate of this.predicates) {
      if (!predicate.apply(context)) return;
    }

    this.handler.handle(context);
  }
}
