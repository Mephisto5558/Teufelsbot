const
  { EmbedBuilder, Colors } = require('discord.js'),
  { Command } = require('reconlx');

module.exports = new Command({
  name: 'account',
  aliases: { prefix: ['acc', 'a'], slash: [] },
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

  run: async (message, lang, { db, functions }) => {
    const
      target = message.options?.getUser('user') || message.mentions?.users.first() || message.user,
      userData = db.get('guildSettings')[message.guild.id]?.economy?.[target.id],
      rank = db.get('guildSettings')[message.guild.id]?.economy?.sort((a, b) => b.power - a.power).indexOf(target.id) + 1,
      embed = new EmbedBuilder({
        color: Colors.White,
        author: { name: target.name, iconURL: target.displayAvatarURL({ forceStatic: true }) },
        footer: { text: message.user.tag },
        thumbnail: { url: target.displayAvatarURL({ forceStatic: true }) },
        description:
          lang('currency', userData?.currency ?? 0) +
          lang('dailyStreak', userData?.dailyStreak ?? 0) +
          lang('rank', !isNaN(rank) && rank ? rank : lang('none'))
      });

    functions.reply({ embeds: [embed] }, message);
  }
})