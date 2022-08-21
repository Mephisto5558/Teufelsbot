const
  { Command } = require('reconlx'),
  { EmbedBuilder, Colors, Message } = require('discord.js'),
  { Dashboard } = require('../../config.json').Website;

module.exports = new Command({
  name: 'dashboard',
  aliases: { prefix: [], slash: [] },
  description: 'get the link to the dashboard',
  usage: '',
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 0 },
  category: 'Information',
  slashCommand: true,
  prefixCommand: true,

  run: async (message, lang, { functions }) => {
    const embed = new EmbedBuilder({
      title: 'Dashboard',
      description: lang('embedDescription', Dashboard),
      color: Colors.Blurple
    });

    message instanceof Message ? functions.reply({ embeds: [embed] }, message) : interaction.editReply({ embeds: [embed] });
  }
})