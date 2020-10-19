import { FunctionalCommandBuilder } from './functional/FunctionalCommandBuilder';

export class Commands {
  public static create(): FunctionalCommandBuilder {
    return FunctionalCommandBuilder.newBuilder();
  }
}
