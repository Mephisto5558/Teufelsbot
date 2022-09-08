const
  { EmbedBuilder, Colors } = require('discord.js'),
  { Invite } = require('../../config.json').Website;

module.exports = {
  name: 'invite',
  aliases: { prefix: [], slash: [] },
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 0 },
  category: 'Information',
  slashCommand: true,
  prefixCommand: true,

  run: async (message, lang) => {
    const embed = new EmbedBuilder({
      title: lang('embedTitle'),
      description: lang('embedDescription', Invite),
      Color: Colors.Blue
    });

    message.customReply({ embeds: [embed] });
  }
}