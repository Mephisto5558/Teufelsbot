const
  { Command } = require('reconlx'),
  { EmbedBuilder, Colors } = require('discord.js');

module.exports = new Command({
  name: 'daily',
  aliases: { prefix: ['d'], slash: [] },
  description: 'get your daily bonuses',
  usage: '',
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 86400000 }, //1d
  category: 'Economy',
  slashCommand: true,
  prefixCommand: true,
  beta: true,

  run: async (message, lang, { db, functions }) => {
    const embed = new EmbedBuilder({
      color: Colors.White,
      author: { name: message.user.tag, iconURL: message.member.displayAvatarURL({ forceStatic: true }) }
    });

    const userData = db.get('guildSettings')[message.guild.id].economy[message.user.id];
    if (!userData.gaining.daily) {
      embed.data.description = lang('notUnlocked');
      return functions.reply({ embeds: [embed] }, message);
    }

    db.set('userSettings', Object.merge(db.get('guildSettings'), {
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
    functions.reply({ embeds: [embed] }, message);
  }
})