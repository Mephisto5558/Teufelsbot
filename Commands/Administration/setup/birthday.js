const
  { hyperlink } = require('discord.js'),

  /** @type {Client['config']} */
  { website: { domain } = {}, disableWebserver } = require(require('node:path').resolve(process.cwd(), 'config.json'));

/** @type {import('.')} */
module.exports = {
  disabled: !!disableWebserver || !domain, // note that this property does not exist yet.
  disabledReason: disableWebserver ? 'The webserver is disabled.' : 'Missing domain url in config.json',

  async run(lang) {
    return this.customReply(lang('useDashboard', hyperlink(lang('link'), `${this.client.config.website.domain}/guild/${this.guild.id}#birthday`)));
  }
};