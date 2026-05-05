const
  { Colors, EmbedBuilder, hyperlink } = require('discord.js'),
  { Command, CommandType, DMPermType } = require('@mephisto5558/command');

const { website = {}, disableWebserver } = require('#Utils').getConfig();

module.exports = new Command({
  types: [CommandType.Slash, CommandType.Prefix],
  dmPermission: DMPermType.CanBeDM,
  disabled: !!disableWebserver || !website.domain || !website.vote,
  disabledReason: disableWebserver ? 'The webserver is disabled.' : 'Missing domain or vote url path in config.json',

  async run(lang) {
    const
      { domain, port, vote } = this.client.config.website,

      embed = new EmbedBuilder({
        title: lang('embedTitle'),
        description: lang('embedDescriptionVote', hyperlink(lang('global.here'), `${domain}/` + (port ? `:${port}` : '') + `/${vote}`)),
        color: Colors.Blurple
      });

    return this.customReply({ embeds: [embed] });
  }
});