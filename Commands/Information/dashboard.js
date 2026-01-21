const
  { Colors, EmbedBuilder, hyperlink } = require('discord.js'),
  { Command, commandTypes } = require('@mephisto5558/command'),
  { website = {}, disableWebserver } = require('#Utils').getConfig();

module.exports = new Command({
  types: [commandTypes.slash, commandTypes.prefix],
  dmPermission: true,
  disabled: !!disableWebserver || !website.domain || !website.dashboard,
  disabledReason: disableWebserver ? 'The webserver is disabled.' : 'Missing dashboard or domain url path in config.json',

  async run(lang) {
    const { domain, port, dashboard } = this.client.config.website;
    if (!domain) return this.customReply(lang('events.command.missingDomainConfig'));

    const embed = new EmbedBuilder({
      title: lang('embedTitle'),
      description: lang('embedDescriptionDashboard', hyperlink(lang('global.here'), domain + (port ? `:${port}` : '') + `/${dashboard}`)),
      color: Colors.Blurple
    });

    return this.customReply({ embeds: [embed] });
  }
});