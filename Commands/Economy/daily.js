const { EmbedBuilder, Colors } = require('discord.js');

module.exports = {
  name: 'daily',
  aliases: { prefix: ['d'], slash: [] },
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 86400000 }, //1d
  category: 'Economy',
  slashCommand: true,
  prefixCommand: true,
  beta: true,

  run: function (lang, { db }) {
    const embed = new EmbedBuilder({
      color: Colors.White,
      author: { name: this.user.tag, iconURL: this.member.displayAvatarURL({ forceStatic: true }) }
    });

    const userData = db.get('guildSettings')[this.guild.id].economy[this.user.id];
    if (!userData.gaining.daily) {
      embed.data.description = lang('notUnlocked');
      return this.customReply({ embeds: [embed] }, 30000);
    }

    db.update('userSettings', `${this.guild.id}.economy.${this.user.id}`, {
      currency: userData.currency + userData.gaining.daily,
      dailyStreak: userData.dailyStreak + 1
    });

    embed.data.description = lang('collected', userData.daily);
    this.customReply({ embeds: [embed] });
  }
};