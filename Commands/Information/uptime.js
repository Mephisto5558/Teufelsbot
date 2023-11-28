const
  { EmbedBuilder, Colors } = require('discord.js'),
  { Domain } = require('../../config.json').Website,
  { timeFormatter } = require('../../Utils');

/**@type {command}*/
module.exports = {
  name: 'uptime',
  cooldowns: { user: 100 },
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,

  run: function (lang) {
    const embed = new EmbedBuilder({
      description: lang('embedDescription', { time: timeFormatter(process.uptime(), lang).formatted, Domain }),
      color: Colors.White
    });

    return this.customReply({ embeds: [embed] });
  }
};