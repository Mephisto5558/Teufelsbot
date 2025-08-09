const
  { Colors, EmbedBuilder, hyperlink } = require('discord.js'),

  /** @type {Client['config']} */
  { website = {}, disableWebserver } = require('#Utils').getConfig();

/** @type {command<'both', false>} */
module.exports = {
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,
  disabled: !!disableWebserver || !website.domain || !website.invite,
  disabledReason: disableWebserver ? 'The webserver is disabled.' : 'Missing invite or domain url path in config.json',

  async run(lang) {
    const
      { domain = 'missingdomain', port = 0, invite } = this.client.config.website, // TODO

      embed = new EmbedBuilder({
        title: lang('embedTitle'),
        description: lang('embedDescription', hyperlink(lang('global.here'), domain + (port ? `:${port}` : '') + `/${invite}`)),
        color: Colors.Blue
      });

    return this.customReply({ embeds: [embed] });
  }
};