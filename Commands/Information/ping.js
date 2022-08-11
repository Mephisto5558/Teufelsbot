const
  { Command } = require('reconlx'),
  { EmbedBuilder, Colors, Message } = require('discord.js');

module.exports = new Command({
  name: 'ping',
  aliases: { prefix: [], slash: [] },
  description: `Get the bot's ping`,
  usage: '',
  permissions: { client: ['EmbedLinks'], user: [] },
  cooldowns: { guild: 0, user: 1000 },
  category: 'Information',
  slashCommand: true,
  prefixCommand: true,
  options: [{
    name: 'average',
    description: 'Gets the ping average',
    type: 'Boolean',
    required: false
  }],

  run: async (message, lang, { ws, functions }) => {
    if (message.args?.[0] == 'average' || message.options?.getBoolean('average')) {
      const embed = new EmbedBuilder({
        title: lang('embedTitle'),
        description: lang('average.loading'),
        color: Colors.Blurple
      });

      message.editReply({ embeds: [embed] });

      let pings = [], i;

      for (i = 0; i <= 59; i++) {
        pings.push(ws.ping);
        await functions.sleep(1000);
      }

      pings.sort((a, b) => a - b);

      const averagePing = Math.round((pings.reduce((a, b) => a + b) / i) * 100) / 100;

      embed.data.description = lang('embedDescription', pings.length, pings[0], pings[pings.length - 1], averagePing);

      return message.editReply({ embeds: [embed] })
    }

    const embed = new EmbedBuilder({
      title: lang('embedTitle'),
      description: lang('global.loading'),
      color: Colors.Green
    });

    const messagePing = Date.now();
    const msg = message instanceof Message ? await message.channel.send({ embeds: [embed] }) : await message.editReply({ embeds: [embed] });
    const endMessagePing = Date.now() - messagePing;

    embed.data.fields = [
      { name: 'API', value: `\`${Math.round(ws.ping)}\`ms`, inline: true },
      { name: 'Bot', value: `\`${Math.abs(Date.now() - message.createdTimestamp)}\`ms`, inline: true },
      { name: lang('messageSend'), value: `\`${endMessagePing}\`ms`, inline: true }
    ];
    embed.data.description = ' ';

    message instanceof Message ? msg.edit({ embeds: [embed] }, message) : message.editReply({ embeds: [embed] });
  }
})