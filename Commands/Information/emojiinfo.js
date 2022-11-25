const
  { parseEmoji, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js'),
  { getAverageColor } = require('fast-average-color-node');

module.exports = {
  name: 'emojiinfo',
  aliases: { prefix: ['emoji-info'] },
  slashCommand: true,
  prefixCommand: true,
  options: [{
    name: 'emoji',
    type: 'String',
    required: true,
  }],

  run: async function (lang) {
    const parsedEmoji = parseEmoji(this.options?.getString('emoji') || this.args?.[0] || '');
    const emoji = this.client.emojis.cache.get(parsedEmoji.id) || parsedEmoji;

    if (!emoji.id) return this.customReply(lang('notFound'));
    if (!emoji.url) emoji.url = `https://cdn.discordapp.com/emojis/${emoji.id}.webp?size=2048`;

    const embed = new EmbedBuilder({
      title: lang('embedTitle', `<:${emoji.name}:${emoji.id}>`),
      color: parseInt((await getAverageColor(emoji.url)).hex.substring(1), 16),
      thumbnail: { url: emoji.url },
      fields: [
        { name: lang('name'), value: emoji.name, inline: true },
        { name: lang('id'), value: emoji.id, inline: true },
        { name: lang('guild'), value: emoji.guild?.name ? `${emoji.guild.name} (${emoji.guild.id})` : lang('unknown'), inline: true },
        { name: lang('animated'), value: lang(`global.${emoji.animated}`), inline: true },
        { name: lang('creator'), value: emoji.author?.tag ?? lang('unknown'), inline: true },
        { name: lang('available'), value: emoji.available ? lang(`global.${emoji.available}`) : lang('unknown'), inline: true },
        { name: lang('createdAt'), value: emoji.createdTimestamp ? `<t:${Math.round(emoji.createdTimestamp / 1000)}>` : lang('unknown'), inline: true },
        { name: lang('requiresColons'), value: emoji.requiresColons ? lang(`global.${emoji.requiresColons}`) : lang('unknown'), inline: true },
        emoji.roles?.cache.size && { name: lang('allowedRoles'), value: `<@&${emoji.roles.cache.map(e => e.id).join('>, <@&')}>`, inline: false }
      ].filter(Boolean)
    });

    const component = new ActionRowBuilder({
      components: [
        new ButtonBuilder({
          label: lang('download'),
          style: ButtonStyle.Link,
          url: emoji.url
        })
      ]
    });

    this.customReply({ embeds: [embed], components: [component] });
  }
};