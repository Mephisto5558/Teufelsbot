const
  { EmbedBuilder, Colors } = require('discord.js'),
  { Website: { Dashboard } = {}, disableWebserver } = require('../../config.json') ?? {};

/** @type {command<'both', false>}*/
module.exports = {
  name: 'dashboard',
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,
  disabled: disableWebserver || !Dashboard,
  disabledReason: disableWebserver ? 'The webserver is disabled.' : 'Missing dashboard url in config.json',

  run: function (lang) {
    const embed = new EmbedBuilder({
      title: lang('embedTitle'),
      description: lang('embedDescriptionDashboard', Dashboard),
      color: Colors.Blurple
    });

    return this.customReply({ embeds: [embed] });
  }
};