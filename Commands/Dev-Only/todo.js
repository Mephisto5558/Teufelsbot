const { hyperlink, channelLink } = require('discord.js');

/** @type {command<'prefix'>} */
module.exports = {
  name: 'todo',
  slashCommand: false,
  prefixCommand: true,

  async run(lang) {
    const { domain = 'missingdomain', port = 0, todo, vote } = this.client.config.website; // TODO
    const domainUrl = domain + (port ? `:${port}` : '');

    return this.reply(
      (domain ? hyperlink(lang('list'), `<${domainUrl}/${todo}>`) : '')
      + (domain ? '\n' + hyperlink(lang('website'), `<${domainUrl}/${vote}>`) : '')
      + '\n' + hyperlink(lang('discordNotes'), `<${channelLink('1183014623507656745', '1011956895529041950')}>`)
    );
  }
};