const { EmbedBuilder, Colors } = require('discord.js');

module.exports = {
  name: 'account',
  aliases: { prefix: ['acc'] },
  slashCommand: true,
  prefixCommand: true,
  options: [{ name: 'user', type: 'User' }],
  beta: true,

  run: function (lang, { db }) {
    const
      target = this.options?.getUser('user') || this.mentions?.users.first() || this.user,
      userData = db.get('guildSettings')[this.guild.id].economy[target.id];

    if (!userData?.gaining?.chat) return this.customReply(lang('targetEconomyNotInitialized'), 3e4);

    const
      rank = Object.entries(db.get('guildSettings')[this.guild.id].economy)
        .filter(e => typeof e[1] == 'object')
        .sort(([, a], [, b]) => b.power - a.power || b.currency - a.currency)
        .map(e => e[0])
        .indexOf(target.id) + 1,
      embed = new EmbedBuilder({
        color: Colors.White,
        author: { name: target.name, iconURL: target.displayAvatarURL({ forceStatic: true }) },
        footer: { text: this.user.tag },
        thumbnail: { url: target.displayAvatarURL({ forceStatic: true }) },
        description:
          lang('currency', { num: userData.currency, max: userData.currencyCapacity }) +
          lang('dailyStreak', userData.dailyStreak) +
          lang('rank', rank ?? lang('global.none'))
      });

    this.customReply({ embeds: [embed] });
  }
};