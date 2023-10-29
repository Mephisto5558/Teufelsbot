const
  { EmbedBuilder, Colors } = require('discord.js'),
  embed = new EmbedBuilder({ color: Colors.White });

module.exports = {
  name: 'changelog',
  aliases: { prefix: ['changelogs'] },
  cooldowns: { user: 1000 },
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,

  /**@this Interaction|Message @param {lang}lang*/
  run: function (lang) {
    return this.customReply({ embeds: [embed.setTitle(lang('embedTitle')).setDescription(this.client.settings.changelog || lang('noneFound'))] });
  }
};