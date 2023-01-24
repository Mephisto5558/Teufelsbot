const { EmbedBuilder, Colors } = require('discord.js');

module.exports = {
  name: 'daily',
  aliases: { prefix: ['d'] },
  cooldowns: { user: 864e5 }, //1d
  slashCommand: true,
  prefixCommand: true,
  beta: true,

  run: function (lang) {
    const embed = new EmbedBuilder({
      color: Colors.White,
      author: { name: this.user.customTag, iconURL: this.member.displayAvatarURL({ forceStatic: true }) }
    });

    const userData = this.guild.db.economy[this.user.id];
    if (!userData.gaining.daily) {
      embed.data.description = lang('notUnlocked');
      return this.customReply({ embeds: [embed] }, 3e4);
    }

    this.client.db.update('userSettings', `${this.guild.id}.economy.${this.user.id}`, {
      currency: userData.currency + userData.gaining.daily,
      dailyStreak: userData.dailyStreak + 1
    });

    embed.data.description = lang('collected', userData.daily);
    this.customReply({ embeds: [embed] });
  }
};