import { Command } from '../Command';
import { CommandCategory } from '../CommandCategory';
import { CommandContext } from '../context/CommandContext';
import { FunctionalCommand } from './FunctionalCommand';
import { Predicate } from '../../../utils/Predicate';
import { Requirement } from '../../../utils/Requirement';
import { CommandPermission, CommandPermissions } from '../CommandPermission';

export class FunctionalCommandBuilder {
  private data: {
    name?: string;
    description?: string;
    aliases?: string[];
    permission?: CommandPermission;
    category?: CommandCategory;
    predicates?: Predicate<CommandContext>[];
  } = {
    predicates: [],
  };

  public static newBuilder(): FunctionalCommandBuilder {
    return new FunctionalCommandBuilder();
  }

  public name(name: string): FunctionalCommandBuilder {
    this.data.name = name;
    return this;
  }

  public description(description: string): FunctionalCommandBuilder {
    this.data.description = description;
    return this;
  }

  public aliases(aliases: string[]): FunctionalCommandBuilder {
    this.data.aliases = aliases;
    return this;
  }

  public permission(permission: CommandPermission): FunctionalCommandBuilder {
    this.data.permission = permission;
    return this;
  }

  public category(category: CommandCategory): FunctionalCommandBuilder {
    this.data.category = category;
    return this;
  }

  public filter(predicate: (context: CommandContext) => boolean): FunctionalCommandBuilder {
    this.data.predicates.push(Predicate.of(predicate));
    return this;
  }

  public req(requirement: Requirement<CommandContext>): FunctionalCommandBuilder {
    this.data.predicates.push(
      Predicate.of((context) => {
        return requirement.control(context);
      })
    );
    return this;
  }

  public handler(handler: (context: CommandContext) => void): Command {
    return new FunctionalCommand(
      this.data.name,
      this.data.description,
      this.data.category,
      this.data.predicates,
      { handle: handler },
      this.data.aliases,
      this.data.permission
    );
  }
}
