const
  { Client, MessageReaction, User } = require('discord.js'),
  I18nProvider = require('../Functions/private/I18nProvider.js'),
  pollReactionEmojis = ['🇦', '🇧', '🇨', '🇩', '🇪', '🇫', '🇬', '🇭', '🇮', '🇯', '❌'],
  defaultBar = '░░░░░░░░░░░░░░░';

/**
 * 
 * @param {Client} client 
 * @param {MessageReaction} reaction 
 * @param {User} user
 */
module.exports = async (client, reaction, user) => {
  let message = reaction.message;
  const pollAuthor = client.db.get('polls')?.[message.id];

  if (!pollAuthor || user.bot) return;

  const lang = I18nProvider.__.bind(I18nProvider, { locale: client.db.get('guildSettings')[reaction.message.guild.id]?.config?.lang || reaction.message.guild.preferredLocale.slice(0, 2) });

  if (pollReactionEmojis.includes(reaction.emoji.name)) {
    message = await message.fetch();
    const embed = message.embeds[0];

    if (reaction.emoji.name == '❌') {
      if (user.id != pollAuthor) return;

      const polls = client.db.get('polls');
      delete polls[message.id];

      client.db.set('polls', polls);

      embed.fields[4] = { name: '', value: lang('commands.fun.vote.ended'), inline: false };

      await message.reactions.removeAll();
      return message.edit({ embeds: [embed], components: [] });
    }
    
    if(message.reactions.cache.find(e => e.users.cache.has(user.id))) return reaction.remove();

    const reactions = message.reactions.cache.filter(e => e.count > 1);
    const reactionCount = reactions.reduce((acc, e) => { return acc + e.count - 1 }, 0);
    const field = embed.fields[3] || { name: lang('commands.fun.vote.currentStatus', 1), inline: false };
    field.value = reactions.map(e => {
      const
        percentage = Number(((e.count - 1) / reactionCount * 100).toFixed(2)),
        barLength = Math.round(percentage * defaultBar.length / 100),
        bar = defaultBar.padStart(defaultBar.length + barLength, '█').slice(0, defaultBar.length)

        return `${e.emoji.name} | ${bar} [${percentage.toFixed(1)}% | ${e.count}]`;
    }).join('\n');

    embed.fields[3] = field;

    return message.edit({ embeds: [embed] })
  }
}