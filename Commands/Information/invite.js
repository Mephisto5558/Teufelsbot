const
  { EmbedBuilder, Colors } = require('discord.js'),
  { Invite } = require('../../config.json')?.Website ?? {};

/**@type {command}*/
module.exports = {
  name: 'invite',
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,
  disabled: !Invite,
  disabledReason: 'Missing invite url in config.json',

  run: function (lang) {
    const embed = new EmbedBuilder({
      title: lang('embedTitle'),
      description: lang('embedDescription', Invite),
      color: Colors.Blue
    });

    return this.customReply({ embeds: [embed] });
  }
};