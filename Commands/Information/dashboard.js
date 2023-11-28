const
  { EmbedBuilder, Colors } = require('discord.js'),
  { Domain, Dashboard } = require('../../config.json').Website;

/**@type {command}*/
module.exports = {
  name: 'dashboard',
  aliases: { slash: ['vote'], prefix: ['vote'] },
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,

  run: function (lang) {
    const embed = new EmbedBuilder({
      title: lang('embedTitle'),
      description: this.commandName == 'dashboard' ? lang('embedDescriptionDashboard', Dashboard) : lang('embedDescriptionVote', `${Domain}/vote`),
      color: Colors.Blurple
    });

    return this.customReply({ embeds: [embed] });
  }
};