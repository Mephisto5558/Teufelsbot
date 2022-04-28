const { Command } = require("reconlx");
const { MessageEmbed } = require("discord.js");
const embedConfig = require('../../Settings/embed.json')

module.exports = new Command({
  name: 'ping',
  aliases: [],
  description: `Show the bot's ping`,
  permissions: {client: [], user: []},
  category : "Information",
  slashCommand: true,
  prefiCommand: true,
  options: [{
    name: "average",
    description: "Gets the ping average",
    type: "BOOLEAN",
    required: false
  }],
  run: async (client, message, interaction) => {

    if(!interaction) return client.functions.reply('Please use `/ping`!', message, 10000);
    args = interaction.options?.getBoolean('average');
    
    if(args) {
      let embed = new MessageEmbed()
        .setColor(embedConfig.embed_color)
        .setTitle('Main Module')
        .setDescription(
          `Loading (this takes about one minute)`
        );
      interaction.editReply({
        embeds: [embed]
      });
      
      async function getAveragePing() {
        let ping = [];
        let averagePing = 0;
        let i = 0;
        
        for(i; i <= 59; i++) {
          ping.push(client.ws.ping);
          averagePing += ping[i];
          await client.functions.sleep(1000);
        };
        
        averagePing = averagePing / i
        averagePing = Math.round((averagePing + Number.EPSILON) * 100) / 100;
        return [averagePing, ping]
      };
      
      const data = await getAveragePing()
      averagePing = data[0];
      ping = data[1];
      
      ping.sort((a, b) => a - b);
      
      embed.setDescription(
        `Pings: \`${ping.length}\`\n` + 
        `Lowest Ping: \`${ping[0]}ms\`\n` +
        `Highest Ping: \`${ping[ping.length - 1]}ms\`\n` +
        `Average Ping: \`${averagePing}ms\``
      )
      interaction.editReply({
        embeds: [embed]
      })
      return;
    }
    
    ping = Math.abs(Date.now() - interaction.createdTimestamp)
    
    let embed = new MessageEmbed()
      .setColor(embedConfig.embed_color)
      .setTitle('Main Module')
      .setDescription(
        `Latency: \`${ping}ms\`\n` + 
        `API Latency: \`${Math.round(client.ws.ping)}ms\``
      );
    
    interaction.editReply({
      embeds: [embed]
    })
  }
})