import { Command } from './Command';
import { Registerer } from './../../utils/Registerer';
import * as Discord from 'discord.js';

export interface CommandRegisterer extends Registerer<Command> {}
