import { BatchRegisterer } from './../../utils/BatchRegisterer';
import { Command } from './Command';

export abstract class CommandBatchRegisterer implements BatchRegisterer<Command> {
  abstract get(): Command[];
}
