const
  { EmbedBuilder, Colors } = require('discord.js'),
  { Domain } = require('../../config.json').Website,
  uptime = require('../../Utils/uptime.js');

module.exports = {
  name: 'uptime',
  aliases: { prefix: [], slash: [] },
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 100 },
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