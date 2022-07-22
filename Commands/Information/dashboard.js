const
  { Command } = require('reconlx'),
  { EmbedBuilder, Colors } = require('discord.js'),
  { name, author } = require('../../package.json');

module.exports = new Command({
  name: 'dashboard',
  aliases: { prefix: [], slash: [] },
  description: 'get the link to the dashboard',
  usage: '',
  permissions: { client: ['EmbedLinks'], user: [] },
  cooldowns: { guild: 0, user: 0 },
  category: 'Information',
  slashCommand: true,
  prefixCommand: true,

  run: async ({ functions }, message, interaction) => {
    const embed = new EmbedBuilder({
      title: 'Dashboard',
      description: `Click [here](https://${name}.${author}.repl.co/) to open the dashboard.`,
      color: Colors.Blurple
    })

    if (interaction) interaction.editReply({ embeds: [embed] });
    else functions.reply({ embeds: [embed] }, message);
  }
})