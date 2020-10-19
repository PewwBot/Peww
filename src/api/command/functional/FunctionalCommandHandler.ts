import { CommandContext } from '../context/CommandContext';

export interface FunctionalCommandHandler {
  handle(context: CommandContext): void;
}
