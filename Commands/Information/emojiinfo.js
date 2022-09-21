const { parseEmoji, EmbedBuilder, Colors } = require('discord.js');

module.exports = {
  name: 'emojiinfo',
  aliases: { prefix: ['emoji-info'], slash: [] },
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 0 },
  category: 'Information',
  slashCommand: true,
  prefixCommand: true,
  options: [{
    name: 'emoji',
    type: 'String',
    required: true,
  }],

  run: async function (lang, { emojis }) {
    const parsedEmoji = parseEmoji(this.options?.getString('emoji') || this.args?.[0] || '');
    const emoji = emojis.cache.get(parsedEmoji.id) || parsedEmoji;

    if (!emoji.id) return this.customReply(lang('notFound'));

    const embed = new EmbedBuilder({
      title: lang('embedTitle', `<:${emoji.name}:${emoji.id}>`),
      color: /*parseInt((await getAverageColor(emoji.url())).hex.substring(1), 16) does not work*/ Colors.White,
      fields: [
        { name: lang('name'), value: emoji.name, inline: true },
        { name: lang('id'), value: emoji.id, inline: true },
        { name: lang('url'), value: emoji.url ? `[Link](${emoji.url})` : lang('unknown'), inline: true },
        { name: lang('guild'), value: emoji.guild?.name ? `${emoji.guild.name} (${emoji.guild.id})` : lang('unknown'), inline: true },
        { name: lang('animated'), value: emoji.animated.toString(), inline: true },
        { name: lang('creator'), value: emoji.author?.tag ?? lang('unknown'), inline: true },
        { name: lang('available'), value: emoji.available?.toString() ?? lang('unknown'), inline: true },
        { name: lang('createdAt'), value: emoji.createdTimestamp ? `<t:${Math.round(emoji.createdTimestamp / 1000)}>` : lang('unknown'), inline: true },
        { name: lang('requiresColons'), value: emoji.requiresColons ?? lang('unknown'), inline: true },
        emoji.roles?.cache.size ? { name: lang('allowedRoles'), value: `<@&${emoji.roles.cache.map(e => e.id).join('>, <@&')}>`, inline: false } : null
      ].filter(Boolean)
    }).setThumbnail(emoji.url);

    this.customReply({ embeds: [embed] });
  }
}