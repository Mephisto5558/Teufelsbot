const
  { parseEmoji, CDNRoutes, ImageFormat, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js'),
  { getAverageColor } = require('fast-average-color-node');

/** @type {command<'both'>}*/
module.exports = {
  usage: { examples: ':derp:' },
  aliases: { prefix: ['emoji-info'] },
  slashCommand: true,
  prefixCommand: true,
  options: [{
    name: 'emoji',
    type: 'String',
    required: true
  }],

  run: async function (lang) {
    const
      parsedEmoji = parseEmoji(this.options?.getString('emoji', true) ?? this.args[0]),
      emoji = this.client.emojis.cache.get(parsedEmoji?.id) ?? parsedEmoji;

    if (!emoji?.id) return this.customReply(lang('notFound'));

    const
      url = emoji.imageURL() ?? CDNRoutes.emoji(emoji.id, ImageFormat.WebP) + '?size=2048',
      embed = new EmbedBuilder({
        title: lang('embedTitle', `<:${emoji.name}:${emoji.id}>`),
        color: Number.parseInt((await getAverageColor(url)).hex.slice(1), 16),
        thumbnail: { url },
        fields: [
          { name: lang('name'), value: emoji.name, inline: true },
          { name: lang('id'), value: `\`${emoji.id}\``, inline: true },
          { name: lang('guild'), value: emoji.guild?.name ? `${emoji.guild.name} (\`${emoji.guild.id}\`)` : lang('global.unknown'), inline: true },
          { name: lang('animated'), value: lang(`global.${emoji.animated}`), inline: true },
          { name: lang('creator'), value: (await emoji.fetchAuthor?.())?.username ?? lang('global.unknownUser'), inline: true },
          { name: lang('available'), value: emoji.available ? lang(`global.${emoji.available}`) : lang('global.unknown'), inline: true },
          { name: lang('createdAt'), value: emoji.createdTimestamp ? `<t:${Math.round(emoji.createdTimestamp / 1000)}>` : lang('global.unknown'), inline: true }
        ]
      }),
      component = new ActionRowBuilder({
        components: [
          new ButtonBuilder({
            label: lang('global.downloadButton'),
            style: ButtonStyle.Link,
            url
          })
        ]
      });

    if (emoji.guild?.id == this.guild.id && this.member.permissions.has(PermissionFlagsBits.ManageGuildExpressions)) {
      component.components.push(new ButtonBuilder({
        label: lang('delete'),
        customId: `infoCMDs.${emoji.id}.delete.emojis`,
        style: ButtonStyle.Danger
      }));
    }

    if (emoji.roles?.cache.size) embed.data.fields.push({ name: lang('allowedRoles'), value: `<@&${emoji.roles.cache.map(e => e.id).join('>, <@&')}>`, inline: false });

    return this.customReply({ embeds: [embed], components: [component] });
  }
};