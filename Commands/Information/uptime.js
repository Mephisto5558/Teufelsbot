const
  { EmbedBuilder, Colors } = require('discord.js'),
  { Website: { Domain } = {}, disableWebserver } = require('../../config.json') ?? {},
  { timeFormatter } = require('../../Utils');

/** @type {command<'both', false>}*/
module.exports = {
  name: 'uptime',
  cooldowns: { channel: 100 },
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,

  run: function (lang) {
    const embed = new EmbedBuilder({
      description: lang(Domain && !disableWebserver ? 'embedDescription' : 'embedDescriptionNoURL', { time: timeFormatter(process.uptime(), lang).formatted, Domain }),
      color: Colors.White
    });

    return this.customReply({ embeds: [embed] });
  }
};