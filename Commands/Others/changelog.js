const
  { EmbedBuilder, Colors } = require('discord.js'),
  embed = new EmbedBuilder({ color: Colors.White });

/** @type {command<'both', false>}*/
module.exports = {
  aliases: { prefix: ['changelogs'] },
  cooldowns: { channel: 1000 },
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,

  run: function (lang) {
    return this.customReply({ embeds: [embed.setTitle(lang('embedTitle')).setDescription(this.client.settings.changelog ?? lang('noneFound'))] });
  }
};