import { AbstractArgument } from '../api/command/argument/AbstractArgument';
import { CommandContext } from '../api/command/context/CommandContext';

export class StringArgument extends AbstractArgument<string> {
  constructor() {
    super({
      name: 'string',
    });
  }

  init(): void {
    this.setupOptions({
      regex: undefined,
      format: {
        type: 'string',
      },
    });
  }

  async to(_context: CommandContext, controlledArg: string | undefined): Promise<string> {
    return controlledArg;
  }
}
