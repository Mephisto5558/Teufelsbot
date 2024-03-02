const
  { EmbedBuilder, Colors } = require('discord.js'),
  { Domain } = require('../../config.json')?.Website ?? {};

/** @type {command<'both', false>}*/
module.exports = {
  name: 'vote',
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,
  disabled: !Domain,
  disabledReason: 'Missing domain url in config.json',

  run: function (lang) {
    const embed = new EmbedBuilder({
      title: lang('embedTitle'),
      description: lang('embedDescriptionVote', `${Domain}/vote`),
      color: Colors.Blurple
    });

    return this.customReply({ embeds: [embed] });
  }
};