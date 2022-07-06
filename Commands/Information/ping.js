const
  { Command } = require('reconlx'),
  { MessageEmbed } = require('discord.js'),
  { colors } = require('../../Settings/embed.json');

module.exports = new Command({
  name: 'ping',
  aliases: { prefix: [], slash: [] },
  description: `Get the bot's ping`,
  usage: '',
  permissions: { client: ['EMBED_LINKS'], user: [] },
  cooldowns: { guild: 0, user: 1000 },
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
    if (interaction) message = interaction;

    if (interaction?.options?.getBoolean('average')) {
      const embed = new MessageEmbed({
        title: 'Ping',
        description: `Pinging... (this takes about one minute)`,
        color: colors.discord.BURPLE
      });

      interaction.editReply({ embeds: [embed] });

      let pings = [], i;

      for (i = 0; i <= 59; i++) {
        pings.push(client.ws.ping);
        await client.functions.sleep(1000);
      }

      pings.sort((a, b) => a - b);

      const averagePing = Math.round((pings.reduce((a, b) => a + b) / i) * 100) / 100;

      embed.description =
        `Pings: \`${pings.length}\`\n` +
        `Lowest Ping: \`${pings[0]}ms\`\n` +
        `Highest Ping: \`${pings[pings.length - 1]}ms\`\n` +
        `Average Ping: \`${averagePing}ms\``;

      return interaction.editReply({ embeds: [embed] })
    }

    const embed = new MessageEmbed({
      title: 'Latency',
      description: 'Loading...',
      color: colors.GREEN
    });

    const messagePing = Date.now();
    const msg = interaction ? await interaction.editReply({ embeds: [embed] }) : await message.channel.send({ embeds: [embed] });
    const endMessagePing = Date.now() - messagePing;

    const startGet = Date.now();
    await client.db.get('QR=.');
    const endGet = Date.now() - startGet;

    const startWrite = Date.now();
    await client.db.set('QR=.', Buffer.from(startWrite.toString()).toString('base64'));
    const endWrite = Date.now() - startWrite;

    const startDelete = Date.now();
    await client.db.delete('QR=.');
    const endDelete = Date.now() - startDelete;

    embed.fields = [
      { name: 'API', value: `${Math.round(client.ws.ping)}ms`, inline: true },
      { name: 'Bot', value: `${Date.now() - message.createdTimestamp}ms`, inline: true },
      { name: 'Message Send', value: `${endMessagePing}ms`, inline: true },
      { name: 'DB Fetch', value: `${endGet}ms`, inline: false },
      { name: 'DB Write', value: `${endWrite}ms`, inline: true },
      { name: 'DB Delete', value: `${endDelete}ms`, inline: true }
    ]

    interaction ? interaction.editReply({ embeds: [embed] }) : msg.edit({ embeds: [embed] }, message);
  }
})