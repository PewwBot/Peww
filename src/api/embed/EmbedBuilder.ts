import * as Discord from 'discord.js';

export class EmbedBuilder extends Discord.MessageEmbed {

  constructor(data?: Discord.MessageEmbed | Discord.MessageEmbedOptions) {
    if (data) super(data);
    else super();
  }

}