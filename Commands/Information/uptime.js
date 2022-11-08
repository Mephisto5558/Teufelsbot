const
  { EmbedBuilder, Colors } = require('discord.js'),
  { Domain } = require('../../config.json').Website,
  uptime = require('../../Utils/uptime.js');

module.exports = {
  name: 'uptime',
  cooldowns: { user: 100 },
  category: 'Information',
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,

  run: function (lang) {
    const embed = new EmbedBuilder({
      description: lang('embedDescription', { time: uptime(true, lang).formatted, Domain }),
      color: Colors.White
    });
    this.customReply({ embeds: [embed] });
  }
};