const
  { Command } = require('reconlx'),
  { Message, EmbedBuilder, Colors } = require('discord.js'),
  { Invite } = require('../../config.json').Website;

module.exports = new Command({
  name: 'invite',
  aliases: { prefix: [], slash: [] },
  description: 'Sends a link to add the bot to your guild!',
  usage: '',
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 0 },
  category: 'Information',
  slashCommand: true,
  prefixCommand: true,

  run: async (message, lang, { functions }) => {
    const embed = new EmbedBuilder({
      title: lang('embedTitle'),
      description: lang('embedDescription', Invite),
      Color: Colors.Blue
    });

    message instanceof Message ? functions.reply({ embeds: [embed] }, message) : message.editReply({ embeds: [embed] })
  }
})