import { StringUtil } from '../../utils/StringUtil';
import { CommandPermission, CommandPermissions } from './CommandPermission';

export class CommandCategory {
  public static readonly MANAGEMENT = new CommandCategory(CommandPermissions.BOT_OWNER, 'management', 'Bot Yönetim');
  public static readonly MODERATION = new CommandCategory(CommandPermissions.STAFF, 'moderation', 'Moderasyon');
  public static readonly SETTING = new CommandCategory(CommandPermissions.STAFF, 'setting', 'Ayar');
  public static readonly OTHER = new CommandCategory(CommandPermissions.USER, 'other', 'Diğer');

  public static readonly VALUES: CommandCategory[] = [CommandCategory.MANAGEMENT, CommandCategory.MODERATION, CommandCategory.SETTING, CommandCategory.OTHER];

  private permission?: CommandPermission | undefined;
  private id: string;
  private qualifiedName: string;

  constructor(permission: CommandPermission = null, id: string, qualifiedName: string) {
    this.permission = permission;
    this.id = 'categories.' + id;
    this.qualifiedName = qualifiedName;
  }

  public static lookupFromString(name: string): CommandCategory | undefined {
    for (const category of this.VALUES) {
      if (category.getQualifiedName() === name) return category;
    }
    return null;
  }

  public static getAllNames(): string[] {
    return this.VALUES.map((category) => StringUtil.capitalize(category.getQualifiedName(), 'tr-TR'));
  }

  public static getAllCategories(): CommandCategory[] {
    return Object.assign([], this.VALUES);
  }

  public getPermission(): CommandPermission | undefined {
    return this.permission;
  }

  public getId(): string {
    return this.id;
  }

  public getQualifiedName(): string {
    return this.qualifiedName;
  }

  public toString(): string {
    return this.qualifiedName;
  }
}
