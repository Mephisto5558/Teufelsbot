const { EmbedBuilder, Colors } = require('discord.js');

module.exports = {
  name: 'account',
  aliases: { prefix: ['acc'], slash: [] },
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 0 },
  category: 'Economy',
  slashCommand: true,
  prefixCommand: true,
  options: [{ name: 'user', type: 'User' }],
  beta: true,

  run: async (message, lang, { db }) => {
    const
      target = message.options?.getUser('user') || message.mentions?.users?.first() || message.user,
      userData = db.get('guildSettings')[message.guild.id].economy[target.id];

    if (!userData?.gaining?.chat) return message.customReply(lang('targetEconomyNotInitialized'), 30000);

    const
      rank = Object.entries(db.get('guildSettings')[message.guild.id].economy)
        .map(([, e]) => e)
        .sort(([, a], [, b]) => b.power - a.power || b.currency - a.currency)
        .indexOf(target.id) + 1,
      embed = new EmbedBuilder({
        color: Colors.White,
        author: { name: target.name, iconURL: target.displayAvatarURL({ forceStatic: true }) },
        footer: { text: message.user.tag },
        thumbnail: { url: target.displayAvatarURL({ forceStatic: true }) },
        description:
          lang('currency', { num: userData.currency, max: userData.currencyCapacity }) +
          lang('dailyStreak', userData.dailyStreak) +
          lang('rank', rank ?? lang('global.none'))
      });

    message.customReply({ embeds: [embed] });
  }
}