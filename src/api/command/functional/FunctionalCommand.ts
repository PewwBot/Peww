import { AbstractCommand } from '../AbstractCommand';
import { CommandCategory } from '../CommandCategory';
import { CommandContext } from '../context/CommandContext';
import { FunctionalCommandHandler } from './FunctionalCommandHandler';
import { Predicate } from '../../../utils/Predicate';

export class FunctionalCommand extends AbstractCommand {
  private readonly predicates: Predicate<CommandContext>[];
  private readonly handler: FunctionalCommandHandler;

  constructor(
    name: string,
    description: string,
    category: CommandCategory,
    predicates: Predicate<CommandContext>[],
    handler: FunctionalCommandHandler,
    aliases?: string[]
  ) {
    super();
    this.name = name;
    this.description = description;
    this.category = category;
    this.predicates = predicates;
    this.handler = handler;
    this.aliases = aliases ? aliases : ['errorred'];
  }

  public call(context: CommandContext): void {
    for (const predicate of this.predicates) {
      if (!predicate.apply(context)) return;
    }

    this.handler.handle(context);
  }

}
