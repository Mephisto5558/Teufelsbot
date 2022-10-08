const
  { EmbedBuilder, Colors } = require('discord.js'),
  { Dashboard } = require('../../config.json').Website;

module.exports = {
  name: 'dashboard',
  aliases: { prefix: [], slash: [] },
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 0 },
  category: 'Information',
  slashCommand: true,
  prefixCommand: true,

  run: function (lang) {
    const embed = new EmbedBuilder({
      title: lang('embedTitle'),
      description: lang('embedDescription', Dashboard),
      color: Colors.Blurple
    });

    this.customReply({ embeds: [embed] });
  }
};