const { Command } = require("reconlx");
const { MessageEmbed } = require("discord.js");
const embedConfig = require('../../Settings/embed.json')

module.exports = new Command({
  name: 'ping',
  aliases: [],
  description: `Show the bot's ping`,
  userPermissions: [],
  category : "Information",
  slashCommand: true,
  run: async (client, message, interaction) => {

    if(!interaction) {
      await client.functions.reply('Please use `/ping` instead of `.ping!`', message, 10000)
      return message.delete();
    }
    
    ping = Math.abs(Date.now() - interaction.createdTimestamp)
    
    let embed = new MessageEmbed()
      .setColor(embedConfig.embed_color)
      .setTitle('Main Module')
      .setDescription(
        `Latency: \`${ping}ms\`\n` + 
        `API Latency: \`${Math.round(client.ws.ping)}ms\``
      )
    interaction.
    interaction.editReply({
      embeds: [embed]
    })
  }
})