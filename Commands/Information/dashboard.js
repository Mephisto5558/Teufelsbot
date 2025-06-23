const
  { EmbedBuilder, Colors, hyperlink } = require('discord.js'),

  /** @type {Client['config']} */
  { website = {}, disableWebserver } = require(require('node:path').resolve(process.cwd(), 'config.json'));

/** @type {command<'both', false>} */
module.exports = {
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,
  disabled: !!disableWebserver || !website.domain || !website.dashboard,
  disabledReason: disableWebserver ? 'The webserver is disabled.' : 'Missing dashboard or domain url path in config.json',

  async run(lang) {
    const { domain, port = 0, dashboard } = this.client.config.website;

    const embed = new EmbedBuilder({
      title: lang('embedTitle'),
      description: lang('embedDescriptionDashboard', hyperlink(lang('global.here'), `${domain}${port ? ':' + port : ''}/${dashboard}`)),
      color: Colors.Blurple
    });

    return this.customReply({ embeds: [embed] });
  }
};