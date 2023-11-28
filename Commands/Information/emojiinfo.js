const
  { parseEmoji, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js'),
  { getAverageColor } = require('fast-average-color-node');

/**@type {command}*/
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

  /**@this GuildInteraction|GuildMessage*/
  run: async function (lang) {
    const
      parsedEmoji = parseEmoji(this.options?.getString('emoji') || this.args?.[0] || ''),
      emoji = this.client.emojis.cache.get(parsedEmoji.id) || parsedEmoji;

    if (!emoji.id) return this.customReply(lang('notFound'));
    emoji.url ??= `https://cdn.discordapp.com/emojis/${emoji.id}.webp?size=2048`;

    const
      embed = new EmbedBuilder({
        title: lang('embedTitle', `<:${emoji.name}:${emoji.id}>`),
        color: parseInt((await getAverageColor(emoji.url)).hex.substring(1), 16),
        thumbnail: { url: emoji.url },
        fields: [
          { name: lang('name'), value: emoji.name, inline: true },
          { name: lang('id'), value: `\`${emoji.id}\``, inline: true },
          { name: lang('guild'), value: emoji.guild?.name ? `${emoji.guild.name} (\`${emoji.guild.id}\`)` : lang('unknown'), inline: true },
          { name: lang('animated'), value: lang(`global.${emoji.animated}`), inline: true },
          { name: lang('creator'), value: (await emoji.fetchAuthor?.())?.username || lang('unknown'), inline: true },
          { name: lang('available'), value: emoji.available ? lang(`global.${emoji.available}`) : lang('unknown'), inline: true },
          { name: lang('createdAt'), value: emoji.createdTimestamp ? `<t:${Math.round(emoji.createdTimestamp / 1000)}>` : lang('unknown'), inline: true },
          { name: lang('requiresColons'), value: emoji.requiresColons ? lang(`global.${emoji.requiresColons}`) : lang('unknown'), inline: true },
        ]
      }),
      component = new ActionRowBuilder({
        components: [
          new ButtonBuilder({
            label: lang('global.downloadButton'),
            style: ButtonStyle.Link,
            url: emoji.url
          })
        ]
      });

    if (emoji.guild?.id == this.guild.id && this.member.permissions.has(PermissionFlagsBits.ManageGuildExpressions)) component.components.push(new ButtonBuilder({
      label: lang('delete'),
      customId: `infoCMDs.${emoji.id}.delete.emojis`,
      style: ButtonStyle.Danger
    }));

    if (emoji.roles?.cache.size) embed.data.fields.push({ name: lang('allowedRoles'), value: `<@&${emoji.roles.cache.map(e => e.id).join('>, <@&')}>`, inline: false });

    return this.customReply({ embeds: [embed], components: [component] });
  }
};