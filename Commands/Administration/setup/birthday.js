/** @import subcommand from '.' */

const
  { hyperlink } = require('discord.js'),
  { website = {}, disableWebserver } = require('#Utils').getConfig();

/** @type {subcommand} */
module.exports = {
  disabled: !!disableWebserver || !website.domain, // note that this property does not exist yet for subcommands.
  disabledReason: disableWebserver ? 'The webserver is disabled.' : 'Missing domain url in config.json',

  async run(lang) {
    const { domain, port } = this.client.config.website;

    if (!domain) return this.customReply(lang('events.command.missingDomainConfig'));
    return this.customReply(lang('useDashboard', hyperlink(lang('link'), domain + (port ? `:${port}` : '') + `/guild/${this.guild.id}#birthday`)));
  }
};