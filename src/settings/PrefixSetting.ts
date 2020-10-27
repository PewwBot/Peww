import { SettingRegisterer } from '../api/setting/SettingRegisterer';

import * as Discord from 'discord.js';
import { Setting } from '../api/setting/Setting';
import { Settings } from '../api/setting/Settings';
import { SettingChangeStatus } from '../api/setting/SettingChangeStatus';
import { Bot } from '../Bot';

export type PrefixMod = 'set' | 'add' | 'remove';

export class PrefixSetting implements SettingRegisterer<Discord.Guild, string[] | undefined, PrefixMod> {
  get(): Setting<Discord.Guild, string[] | undefined, PrefixMod> {
    return Settings.create<Discord.Guild, string[] | undefined, PrefixMod>('prefix')
      .getHandler(async (guild) => {
        const guildData = await Bot.getInstance().getCacheManager().getGuild(guild.id);
        if (!guildData) return null;
        return guildData.getCustomPrefix();
      })
      .changeHandler(async (guild, data, mode) => {
        const guildData = await Bot.getInstance().getCacheManager().getGuild(guild.id);
        if (!guildData) return SettingChangeStatus.of();
        if (mode === 'set') {
          guildData.customPrefix = data;
          if (await guildData.save()) {
            return SettingChangeStatus.of(data);
          }
        } else if (mode === 'add') {
          const changedData = data.filter((val) => !guildData.customPrefix.includes(val));
          if (changedData.length < 1) return SettingChangeStatus.of([]);
          guildData.customPrefix.push(...changedData);
          if (await guildData.save()) {
            return SettingChangeStatus.of(changedData);
          }
        } else if (mode === 'remove') {
          const changedData = data.filter((val) => guildData.customPrefix.includes(val));
          if (changedData.length < 1) return SettingChangeStatus.of([]);
          guildData.customPrefix = guildData.customPrefix.filter((val) => !changedData.includes(val));
          if (await guildData.save()) {
            return SettingChangeStatus.of(changedData);
          }
        }
        return SettingChangeStatus.of();
      });
  }
}
