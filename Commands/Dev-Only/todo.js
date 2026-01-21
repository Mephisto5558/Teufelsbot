const
  { channelLink, hyperlink } = require('discord.js'),
  { Command, commandTypes } = require('@mephisto5558/command');

module.exports = new Command({
  types: [commandTypes.prefix],

  async run(lang) {
    const { domain, port, todo, vote } = this.client.config.website;

    let domainUrl;
    if (domain) domainUrl = domain + (port ? `:${port}` : '');

    return this.reply(
      (domainUrl ? hyperlink(lang('list'), `<${domainUrl}/${todo}>`) : '')
      + (domainUrl ? '\n' + hyperlink(lang('website'), `<${domainUrl}/${vote}>`) : '')
      + '\n' + hyperlink(lang('discordNotes'), `<${channelLink('1183014623507656745', '1011956895529041950')}>`)
    );
  }
});