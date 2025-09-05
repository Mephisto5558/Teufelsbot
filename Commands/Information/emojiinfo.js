const
  {
    ActionRowBuilder, ButtonBuilder, ButtonStyle, CDNRoutes, EmbedBuilder, ImageFormat,
    PermissionFlagsBits, inlineCode, parseEmoji, roleMention
  } = require('discord.js'),
  { getAverageColor } = require('fast-average-color-node'),
  { timestamp } = require('#Utils').timeFormatter,
  emojiURLRegex = /https:\/\/cdn\.discordapp\.com\/emojis\/(?<id>\d+)/;

/** @type {command<'both'>} */
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

  async run(lang) {
    const
      parsedEmoji = parseEmoji(this.options?.getString('emoji', true) ?? this.args[0]),

      /** @type {import('discord.js').GuildEmoji | import('discord.js').PartialEmoji | undefined} */
      emoji = this.client.emojis.cache.get(parsedEmoji?.id ?? emojiURLRegex.exec(this.content)?.groups.id) ?? parsedEmoji;

    if (!emoji?.id) return this.customReply(lang('notFound'));

    const
      url = CDNRoutes.emoji(emoji.id, ImageFormat.WebP) + '?size=2048',
      embed = new EmbedBuilder({
        title: lang('embedTitle', `<:${emoji.name}:${emoji.id}>`),
        color: Number.parseInt((await getAverageColor(url)).hex.slice(1), 16),
        thumbnail: { url },
        fields: [
          [lang('name'), emoji.name],
          [lang('id'), inlineCode(emoji.id)],
          [lang('guild'), 'guild' in emoji ? `${emoji.guild.name} (${inlineCode(emoji.guild.id)})` : lang('global.unknown')],
          [lang('animated'), lang(`global.${emoji.animated}`)],
          [lang('creator'), (await emoji.fetchAuthor?.())?.username ?? lang('global.unknownUser')],
          [lang('available'), 'available' in emoji && emoji.available != undefined ? lang(`global.${emoji.available}`) : lang('global.unknown')],
          [lang('createdAt'), emoji.createdTimestamp ? timestamp(emoji.createdTimestamp) : lang('global.unknown')]
        ].map(/** @param {[string, string]} field */ ([k, v]) => ({ name: k, value: v, inline: true }))
      }),
      component = new ActionRowBuilder({
        components: [
          new ButtonBuilder({
            label: lang('global.downloadButton'),
            style: ButtonStyle.Link,
            url
          }),
          new ButtonBuilder({
            customId: `infoCMDs.${emoji.id}.addToGuild.emojis`,
            label: lang('addToGuild'),
            style: ButtonStyle.Primary
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

    if ('roles' in emoji && emoji.roles.cache.size)
      embed.data.fields.push({ name: lang('allowedRoles'), value: emoji.roles.cache.map(e => roleMention(e.id)).join(', '), inline: false });

    return this.customReply({ embeds: [embed], components: [component] });
  }
};