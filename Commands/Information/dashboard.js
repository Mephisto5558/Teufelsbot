const
  { EmbedBuilder, Colors } = require('discord.js'),

  /** @type {Client['config']} */
  { website: { dashboard } = {}, disableWebserver } = require('../../config.json');

module.exports = new MixedCommand({
  dmPermission: true,
  disabled: !!disableWebserver || !dashboard,
  disabledReason: disableWebserver ? 'The webserver is disabled.' : 'Missing dashboard url in config.json',

  run: async function (lang) {
    const embed = new EmbedBuilder({
      title: lang('embedTitle'),
      description: lang('embedDescriptionDashboard', this.client.config.website.dashboard),
      color: Colors.Blurple
    });

    return this.customReply({ embeds: [embed] });
  }
});