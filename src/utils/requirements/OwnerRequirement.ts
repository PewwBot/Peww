import * as Discord from 'discord.js';
import { ImmutableCommandContext } from '../../api/command/context/ImmutableCommandContext';
import { Requirement } from '../Requirement';

export class OwnerRequirement implements Requirement<any> {

  control(x: any): boolean {
    if (x instanceof ImmutableCommandContext) return x.getMessage().guild.ownerID === x.getMessage().member.id;
    return false;
  }

}