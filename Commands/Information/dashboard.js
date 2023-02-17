const
  { EmbedBuilder, Colors } = require('discord.js'),
  { Dashboard } = require('../../config.json').Website;

module.exports = {
  name: 'dashboard',
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,

  run: function (lang) {
    const embed = new EmbedBuilder({
      title: lang('embedTitle'),
      description: lang('embedDescription', Dashboard),
      color: Colors.Blurple
    });

    return this.customReply({ embeds: [embed] });
  }
};