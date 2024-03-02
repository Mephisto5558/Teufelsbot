const
  { EmbedBuilder, Colors } = require('discord.js'),
  { Website: { Invite } = {}, disableWebserver } = require('../../config.json') ?? {};

/** @type {command<'both', false>}*/
module.exports = {
  name: 'invite',
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,
  disabled: disableWebserver || !Invite,
  disabledReason: disableWebserver ? 'The webserver is disabled.' : 'Missing invite url in config.json',

  run: function (lang) {
    const embed = new EmbedBuilder({
      title: lang('embedTitle'),
      description: lang('embedDescription', Invite),
      color: Colors.Blue
    });

    return this.customReply({ embeds: [embed] });
  }
};