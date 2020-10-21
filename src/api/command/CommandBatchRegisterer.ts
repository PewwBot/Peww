import { BatchRegisterer } from './../../utils/BatchRegisterer';
import * as Discord from 'discord.js';
import { Command } from './Command';

export interface CommandBatchRegisterer extends BatchRegisterer<Command> {}
