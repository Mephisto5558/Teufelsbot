const
  { EmbedBuilder, Colors } = require('discord.js'),

  /** @type {Client['config']} */
  { website: { domain } = {}, disableWebserver } = require('../../config.json');

module.exports = new MixedCommand({
  dmPermission: true,
  disabled: !!disableWebserver || !domain,
  disabledReason: disableWebserver ? 'The webserver is disabled.' : 'Missing domain url in config.json',

  run: async function (lang) {
    const embed = new EmbedBuilder({
      title: lang('embedTitle'),
      description: lang('embedDescriptionVote', `${this.client.config.website.domain}/vote`),
      color: Colors.Blurple
    });

    return this.customReply({ embeds: [embed] });
  }
});