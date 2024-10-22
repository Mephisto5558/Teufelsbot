const
  { EmbedBuilder, Colors } = require('discord.js'),

  /** @type {Client['config']} */
  { website: { dashboard } = {}, disableWebserver } = require('../../config.json');

/** @type {command<'both', false>}*/
module.exports = {
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,
  disabled: !!disableWebserver || !dashboard,
  disabledReason: disableWebserver ? 'The webserver is disabled.' : 'Missing dashboard url in config.json',

  async run(lang) {
    const embed = new EmbedBuilder({
      title: lang('embedTitle'),
      description: lang('embedDescriptionDashboard', this.client.config.website.dashboard),
      color: Colors.Blurple
    });

    return this.customReply({ embeds: [embed] });
  }
};