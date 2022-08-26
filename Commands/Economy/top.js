const
  { Command } = require('reconlx'),
  { EmbedBuilder, Colors } = require('discord.js');

module.exports = new Command({
  name: 'top',
  aliases: { prefix: ['t'], slash: [] },
  description: 'Displays the most powerful members.',
  usage: '',
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 0 },
  category: 'Economy',
  slashCommand: true,
  prefixCommand: true,
  beta: true,

  run: async (message, lang, { db, functions }) => {
    const fields = Object.entries(db.get('guildSettings')[message.guild.id]?.economy || {})
      .sort(([, a], [, b]) => b.power - a.power)
      .slice(0, 10)
      .filter(([, e]) => e.currency)
      .map(([k, v], i) => ({
        name: ([':first_place: ', ':second_place: ', ':third_place: '][i] || `${i}. `) + `<@${k}>`,
        value:
          lang('currency', v.currency) +
          lang('power', v.power),
        inline: false
      }));

    const embed = new EmbedBuilder({
      title: lang('embedTitle'),
      color: Colors.White,
      footer: { text: message.user.tag },
      fields: fields,
      description: fields.length ? lang('embedDescription') : lang('noneFound')
    });

    functions.reply({ embeds: [embed] }, message);
  }
})