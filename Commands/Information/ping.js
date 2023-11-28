const { EmbedBuilder, Colors } = require('discord.js');

/**@type {command}*/
module.exports = {
  name: 'ping',
  cooldowns: { user: 1000 },
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,
  beta: true,
  options: [{ name: 'average', type: 'Boolean' }],

  run: async function (lang) {
    const
      average = this.args?.[0] == 'average' || this.options?.getBoolean('average'),
      embed = new EmbedBuilder({
        title: lang('embedTitle'),
        description: lang(average ? 'average.loading' : 'global.loading', { current: 1, target: 20 }),
        color: Colors.Green
      }),
      startMessagePing = performance.now(),
      msg = await this.customReply({ embeds: [embed] }),
      endMessagePing = performance.now() - startMessagePing;

    if (average) {
      const wsPings = [this.client.ws.ping], msgPings = [endMessagePing];

      for (let i = 2; i <= 20; i++) {
        await sleep(3000);
        
        wsPings.push(this.client.ws.ping);

        const startMessagePing = performance.now();
        await msg.edit({ embeds: [embed.setDescription(lang('average.loading', { current: i, target: 20 }))] });
        msgPings.push(performance.now() - startMessagePing);
      }

      wsPings.sort((a, b) => a - b);
      msgPings.sort((a, b) => a - b);

      const averageWsPing = Math.round(wsPings.reduce((a, b) => a + b) / 20 * 100) / 100;
      const averageMsgPing = Math.round(msgPings.reduce((a, b) => a + b) / 20 * 100) / 100;

      embed.data.description = lang('average.embedDescription', {
        pings: wsPings.length, wsLowest: wsPings[0], wsHighest: wsPings[wsPings.length - 1], wsAverage: averageWsPing,
        msgLowest: msgPings[0].toFixed(2), msgHighest: msgPings[msgPings.length - 1].toFixed(2), msgAverage: averageMsgPing
      });
    }
    else {
      embed.data.fields = [
        { name: lang('api'), value: `\`${Math.round(this.client.ws.ping)}\`ms`, inline: true },
        { name: lang('bot'), value: `\`${Math.abs(Date.now() - this.createdTimestamp)}\`ms`, inline: true },
        { name: lang('messageSend'), value: `\`${Math.round(endMessagePing)}\`ms`, inline: true }
      ];

      delete embed.data.description;
    }

    return msg.edit({ embeds: [embed] });
  }
};