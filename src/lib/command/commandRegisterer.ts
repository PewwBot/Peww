import { BatchRegisterer, Registerer } from "../registerer/registerer";
import { Command } from "./command";

export abstract class CommandRegisterer implements Registerer<Command> {
  abstract get(): Command;
}

export abstract class CommandBatchRegisterer implements BatchRegisterer<Command> {
  abstract get(): Command[];
}