import { Command } from './Command';
import { Registerer } from './../../utils/Registerer';

export abstract class CommandRegisterer implements Registerer<Command> {
  abstract get(): Command;
}
