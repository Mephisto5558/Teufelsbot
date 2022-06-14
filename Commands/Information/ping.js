const
  { Command } = require('reconlx'),
  { MessageEmbed } = require('discord.js'),
  { colors } = require('../../Settings/embed.json');

module.exports = new Command({
  name: 'ping',
  aliases: [],
  description: `Get the bot's ping`,
  usage: '',
  permissions: { client: [], user: [] },
  cooldowns: { global: '', user: '' },
  category: 'Information',
  slashCommand: true,
  prefixCommand: true,
  options: [{
    name: 'average',
    description: 'Gets the ping average',
    type: 'BOOLEAN',
    required: false
  }],

  run: async (client, message, interaction) => {
    if (message) return client.functions.reply('Please use `/ping`!', message, 10000);

    if (interaction.options?.getBoolean('average')) {
      const embed = new MessageEmbed()
        .setTitle('Ping')
        .setDescription(`Pinging... (this takes about one minute)`)
        .setColor(colors.discord.BURPLE);

      interaction.editReply({ embeds: [embed] });

      let pings = [], i;

      for (i = 0; i <= 59; i++) {
        pings.push(client.ws.ping);
        await client.functions.sleep(1000);
      }

      pings.sort((a, b) => a - b);

      const averagePing = Math.round((pings.reduce((a, b) => a + b) / i) * 100) / 100;

      embed
        .setDescription(
          `Pings: \`${pings.length}\`\n` +
          `Lowest Ping: \`${pings[0]}ms\`\n` +
          `Highest Ping: \`${pings[pings.length - 1]}ms\`\n` +
          `Average Ping: \`${averagePing}ms\``
        )

      return interaction.editReply({ embeds: [embed] })
    }

    const ping = Math.abs(Date.now() - interaction.createdTimestamp);

    const embed = new MessageEmbed()
      .setTitle('Ping')
      .setDescription(
        `Latency: \`${ping}ms\`\n` +
        `API Latency: \`${Math.round(client.ws.ping)}ms\``
      )
      .setColor(colors.discord.BURPLE);

    interaction.editReply({ embeds: [embed] });
  }
})