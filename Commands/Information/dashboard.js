const
  { Command } = require('reconlx'),
  { EmbedBuilder } = require('discord.js'),
  { name, author } = require('../../package.json'),
  { colors } = require('../../Settings/embed.json');

module.exports = new Command({
  name: 'dashboard',
  aliases: { prefix: [], slash: [] },
  description: 'get the link to the dashboard',
  usage: '',
  permissions: { client: ['EMBED_LINKS'], user: [] },
  cooldowns: { guild: 0, user: 0 },
  category: 'Information',
  slashCommand: true,
  prefixCommand: true,

  run: async(client, message, interaction) => {
    const embed = new EmbedBuilder({
      title: 'Dashboard',
      description: `Click [here](https://${name}.${author}.repl.co/) to open the dashboard.`,
      color: colors.discord.BURPLE
    })

    if(interaction) interaction.editReply({ embeds: [embed]});
    else client.functions.reply({embeds: [embed]}, message);
  }
})