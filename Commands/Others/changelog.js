const
  { EmbedBuilder, Colors } = require('discord.js'),
  embed = new EmbedBuilder({ color: Colors.White });

/**@type {command}*/
module.exports = {
  name: 'changelog',
  aliases: { prefix: ['changelogs'] },
  cooldowns: { user: 1000 },
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,

  run: function (lang) {
    return this.customReply({ embeds: [embed.setTitle(lang('embedTitle')).setDescription(this.client.settings.changelog || lang('noneFound'))] });
  }
};