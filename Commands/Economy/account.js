const { EmbedBuilder, Colors } = require('discord.js');

module.exports = {
  name: 'account',
  aliases: { prefix: ['acc'], slash: [] },
  description: 'show your account and stats',
  usage: 'account [user]',
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 0 },
  category: 'Economy',
  slashCommand: true,
  prefixCommand: true,
  options: [{
    name: 'user',
    description: 'The user you want to get the account of',
    type: 'User',
    required: false
  }],
  beta: true,

  run: async (message, lang, { db }) => {
    const
      target = message.options?.getUser('user') || message.mentions?.users?.first() || message.user,
      userData = db.get('guildSettings')[message.guild.id].economy[target.id];

    if (!userData) return message.customreply(lang('targetEconomyNotInitialized'));

    const
      rank = Object.entries(db.get('guildSettings')[message.guild.id].economy).sort(([, a], [, b]) => b.power - a.power).map(([e]) => e).indexOf(target.id) + 1,
      embed = new EmbedBuilder({
        color: Colors.White,
        author: { name: target.name, iconURL: target.displayAvatarURL({ forceStatic: true }) },
        footer: { text: message.user.tag },
        thumbnail: { url: target.displayAvatarURL({ forceStatic: true }) },
        description:
          lang('currency', userData.currency, userData.currencyCapacity) +
          lang('dailyStreak', userData.dailyStreak) +
          lang('rank', !isNaN(rank) && rank ? rank : lang('none'))
      });

    message.customreply({ embeds: [embed] });
  }
}