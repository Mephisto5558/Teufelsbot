const
  { EmbedBuilder, Colors } = require('discord.js'),
  { Domain } = require('../../config.json').Website;

module.exports = {
  name: 'uptime',
  aliases: { prefix: [], slash: [] },
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 100 },
  category: 'Information',
  slashCommand: true,
  prefixCommand: true,

  run: function (lang, { functions }) {
    const embed = new EmbedBuilder({
      description: lang('embedDescription', { time: functions.uptime(true, lang).formatted, Domain }),
      color: Colors.White
    });
    this.customReply({ embeds: [embed] });
  }
};