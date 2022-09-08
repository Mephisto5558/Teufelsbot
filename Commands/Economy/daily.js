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

  run: async (message, lang, { db }) => {
    const embed = new EmbedBuilder({
      color: Colors.White,
      author: { name: message.user.tag, iconURL: message.member.displayAvatarURL({ forceStatic: true }) }
    });

    const userData = db.get('guildSettings')[message.guild.id].economy[message.user.id];
    if (!userData.gaining.daily) {
      embed.data.description = lang('notUnlocked');
      return message.customReply({ embeds: [embed] }, 30000);
    }

    db.set('userSettings', db.get('guildSettings').fMerge({
      [message.guild.id]: {
        economy: {
          [message.user.id]: {
            currency: userData.currency + userData.gaining.daily,
            dailyStreak: userData.dailyStreak + 1
          }
        }
      }
    }));

    embed.data.description = lang('collected', userData.daily);
    message.customReply({ embeds: [embed] });
  }
}