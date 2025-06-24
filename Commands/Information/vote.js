const
  { EmbedBuilder, Colors, hyperlink } = require('discord.js'),

  /** @type {Client['config']} */
  { website = {}, disableWebserver } = require(require('node:path').resolve(process.cwd(), 'config.json'));

module.exports = new MixedCommand({
  dmPermission: true,
  disabled: !!disableWebserver || !website.domain || !website.vote,
  disabledReason: disableWebserver ? 'The webserver is disabled.' : 'Missing domain or vote url path in config.json',

  async run(lang) {
    const { domain, port = 0, vote } = this.client.config.website;

    const embed = new EmbedBuilder({
      title: lang('embedTitle'),
      description: lang('embedDescriptionVote', hyperlink(lang('global.here'), `${domain}/${port ? ':' + port : ''}/${vote}`)),
      color: Colors.Blurple
    });

    return this.customReply({ embeds: [embed] });
  }
});