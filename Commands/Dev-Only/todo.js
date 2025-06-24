const { hyperlink, channelLink } = require('discord.js');

module.exports = new PrefixCommand({
  dmPermission: true,

  async run(lang) {
    const { domain, port = 0, todo, vote } = this.client.config.website;
    const domainUrl = domain + (port ? ':' + port : '');

    return this.reply(
      (domain ? hyperlink(lang('list'), `<${domainUrl}/${todo}>`) : '')
      + (domain ? hyperlink(lang('website'), `<${domainUrl}/${vote}>`) : '')
      + hyperlink(lang('discordNotes'), `<${channelLink('1183014623507656745', '1011956895529041950')}>`)
    );
  }
});