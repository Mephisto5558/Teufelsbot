const { EmbedBuilder, Colors } = require('discord.js');

module.exports = {
  name: 'ping',
  aliases: { prefix: [], slash: [] },
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 1000 },
  category: 'Information',
  slashCommand: true,
  prefixCommand: true,
  options: [{ name: 'average', type: 'Boolean' }],

  run: async (message, lang, { ws, functions }) => {
    const
      average = message.args?.[0] == 'average' || message.options?.getBoolean('average'),
      embed = new EmbedBuilder({
        title: lang('embedTitle'),
        description: lang(average ? 'average.loading' : 'global.loading'),
        color: Colors.Green
      }),
      messagePing = Date.now(),
      msg = await message.customReply({ embeds: [embed] }),
      endMessagePing = Date.now() - messagePing;

    if (average) {
      let pings = [], i;

      for (i = 0; i <= 59; i++) {
        pings.push(ws.ping);
        await functions.sleep(1000);
      }

      pings.sort((a, b) => a - b);

      const averagePing = Math.round(pings.reduce((a, b) => a + b) / i * 100) / 100;

      embed.data.description = lang('average.embedDescription', { pings: pings.length, lowest: pings[0], heightest: pings[pings.length - 1], average: averagePing });
    }
    else {
      embed.data.fields = [
        { name: 'API', value: `\`${Math.round(ws.ping)}\`ms`, inline: true },
        { name: 'Bot', value: `\`${Math.abs(Date.now() - message.createdTimestamp)}\`ms`, inline: true },
        { name: lang('messageSend'), value: `\`${endMessagePing}\`ms`, inline: true }
      ];
      embed.data.description = ' ';
    }

    msg.edit({ embeds: [embed] });
  }
}