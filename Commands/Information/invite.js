const
  { EmbedBuilder, Colors } = require('discord.js'),
  { Invite } = require('../../config.json').Website;

module.exports = {
  name: 'invite',
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,

  run: function (lang) {
    const embed = new EmbedBuilder({
      title: lang('embedTitle'),
      description: lang('embedDescription', Invite),
      Color: Colors.Blue
    });

    return this.customReply({ embeds: [embed] });
  }
};