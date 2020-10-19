import { CommandCategory } from './CommandCategory';
import { CommandContext } from './context/CommandContext';

export interface Command {
  name: string;
  description: string;
  aliases: string[];
  category: CommandCategory;

  register(): void;

  unregister(): void;

  call(context: CommandContext): void;
}
