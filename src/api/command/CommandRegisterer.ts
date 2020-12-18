import { Registerer } from './../../utils/Registerer';
import { Command } from './Command';

export abstract class CommandRegisterer implements Registerer<Command> {
  abstract get(): Command;
}
