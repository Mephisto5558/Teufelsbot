const
  { EmbedBuilder, Colors } = require('discord.js'),
  { Domain, Dashboard } = require('../../config.json')?.Website ?? {};

/** @type {command<'both', false>}*/
module.exports = {
  name: 'dashboard',
  aliases: { slash: ['vote'], prefix: ['vote'] },
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,
  disabled: !Dashboard || !Domain,
  disabledReason: 'Missing dashboard or domain url in config.json',

  run: function (lang) {
    const embed = new EmbedBuilder({
      title: lang('embedTitle'),
      description: this.commandName == 'dashboard' ? lang('embedDescriptionDashboard', Dashboard) : lang('embedDescriptionVote', `${Domain}/vote`),
      color: Colors.Blurple
    });

    return this.customReply({ embeds: [embed] });
  }
};