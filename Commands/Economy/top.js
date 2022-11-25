const { EmbedBuilder, Colors } = require('discord.js');

module.exports = {
  name: 'top',
  aliases: { prefix: ['t'] },
  slashCommand: true,
  prefixCommand: true,
  beta: true,

  run: function (lang) {
    const description = Object.entries(this.guild.db.economy || {})
      .sort(([, a], [, b]) => b.power - a.power || b.currency - a.currency)
      .slice(0, 10)
      .filter(([, e]) => e.currency)
      .map(([k, v], i) =>
        ([':first_place: ', ':second_place: ', ':third_place: '][i] || `${i + 1}. `) + `<@${k}>\n` +
        lang('currency', v.currency) +
        lang('power', v.power)
      )
      .join('\n');

    const embed = new EmbedBuilder({
      title: lang('embedTitle'),
      color: Colors.White,
      footer: { text: this.user.tag },
      description: description ? lang('embedDescription') + description : lang('noneFound')
    });

    this.customReply({ embeds: [embed] });
  }
};