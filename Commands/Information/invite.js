const
  { EmbedBuilder, Colors } = require('discord.js'),

  /** @type {Client['config']} */
  { website: { invite } = {}, disableWebserver } = require('../../config.json');

module.exports = new MixedCommand({
  dmPermission: true,
  disabled: !!disableWebserver || !invite,
  disabledReason: disableWebserver ? 'The webserver is disabled.' : 'Missing invite url in config.json',

  run: async function (lang) {
    const embed = new EmbedBuilder({
      title: lang('embedTitle'),
      description: lang('embedDescription', this.client.config.website.invite),
      color: Colors.Blue
    });

    return this.customReply({ embeds: [embed] });
  }
});