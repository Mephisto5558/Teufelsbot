const
  { Colors, EmbedBuilder, TimestampStyles, inlineCode } = require('discord.js'),
  { timeFormatter: { msInSecond, timestamp }, toMs: { secToMs }, constants: { maxPercentage } } = require('#Utils'),

  embedUpdateMs = secToMs(4); /* eslint-disable-line @typescript-eslint/no-magic-numbers */

/** @type {command<'both', false>} */
module.exports = {
  cooldowns: { channel: secToMs(1) },
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,
  beta: true,
  options: [{ name: 'average', type: 'Boolean' }],

  async run(lang) {
    const
      average = this.options?.getBoolean('average') ?? this.args?.[0] == 'average',
      maxPings = 20,
      embed = new EmbedBuilder({
        title: lang('embedTitle'),
        description: lang(
          average ? 'average.loading' : 'global.loading', {
            emoji: this.client.application.getEmoji('loading'), current: 1, target: maxPings,
            timestamp: timestamp(Date.now() + embedUpdateMs, TimestampStyles.RelativeTime)
          }
        ),
        color: Colors.Green
      }),
      startFirstMessagePing = performance.now(),
      msg = await this.customReply({ embeds: [embed] }),
      endFirstMessagePing = performance.now() - startFirstMessagePing;

    if (average) {
      const
        pingStart = performance.now(),
        msgPings = [endFirstMessagePing];

      let wsPings = [this.client.ws.ping];

      for (let sleepTime = 3000, i = 2; i <= maxPings; i++) {
        await sleep(sleepTime);

        wsPings.push(this.client.ws.ping);

        const startMessagePing = performance.now();
        await msg.edit({ embeds: [embed.setDescription(lang('average.loading', {
          current: inlineCode(i), target: inlineCode(maxPings), timestamp: timestamp(Date.now() + embedUpdateMs, TimestampStyles.RelativeTime)
        }))] });
        msgPings.push(performance.now() - startMessagePing);
      }

      const duration = Number.parseFloat(((performance.now() - pingStart) / msInSecond).toFixed(2));

      wsPings = wsPings.filter(e => e > 0);
      wsPings.sort((a, b) => a - b);
      msgPings.sort((a, b) => a - b);

      const
        averageWsPing = Math.round(wsPings.reduce((a, b) => a + b, 0) / maxPings * maxPercentage) / maxPercentage,
        averageMsgPing = Math.round(msgPings.reduce((a, b) => a + b, 0) / maxPings * maxPercentage) / maxPercentage;

      embed.data.description = lang('average.embedDescription', {
        duration,
        pings: inlineCode(wsPings.length), wsLowest: wsPings[0], wsHighest: wsPings.at(-1), wsAverage: averageWsPing,
        msgLowest: msgPings[0].toFixed(2), msgHighest: msgPings.at(-1).toFixed(2), msgAverage: averageMsgPing
      });
    }
    else {
      embed.data.fields = [
        { name: lang('api'), value: `${inlineCode(Math.round(this.client.ws.ping))}ms`, inline: true },
        { name: lang('bot'), value: `${inlineCode(Math.abs(Date.now() - this.createdTimestamp))}ms`, inline: true },
        { name: lang('messageSend'), value: `${inlineCode(Math.round(endFirstMessagePing))}ms`, inline: true }
      ];

      delete embed.data.description;
    }

    return msg.edit({ embeds: [embed] });
  }
};