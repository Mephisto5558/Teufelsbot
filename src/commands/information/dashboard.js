const
  { Colors, EmbedBuilder, hyperlink } = require('discord.js'),
  { AllContexts, Command, CommandType } = require('@mephisto5558/command');

const { website = {}, disableWebserver } = require('#Utils').getConfig();

module.exports = new Command({
  types: [CommandType.Slash, CommandType.Prefix],
  contexts: AllContexts,
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