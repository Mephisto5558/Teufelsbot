const
  { EmbedBuilder, Colors, hyperlink } = require('discord.js'),

  /** @type {Client['config']} */
  { website = {}, disableWebserver } = require(require('node:path').resolve(process.cwd(), 'config.json'));

/** @type {command<'both', false>} */
module.exports = {
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,
  disabled: !!disableWebserver || !website.domain || !website.invite,
  disabledReason: disableWebserver ? 'The webserver is disabled.' : 'Missing invite or domain url path in config.json',

  async run(lang) {
    const { domain, port = 0, invite } = this.client.config.website;

    const embed = new EmbedBuilder({
      title: lang('embedTitle'),
      description: lang('embedDescription', hyperlink(lang('global.here'), `${domain}${port ? ':' + port : ''}/${invite}`)),
      color: Colors.Blue
    });

    return this.customReply({ embeds: [embed] });
  }
};