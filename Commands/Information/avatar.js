const
  { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ALLOWED_SIZES, bold, hyperlink } = require('discord.js'),
  { getAverageColor } = require('fast-average-color-node'),
  { getTargetMembers, timeFormatter: { msInSecond } } = require('#Utils');

/** @type {command<'both', false>} */
module.exports = {
  cooldowns: { user: msInSecond },
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,
  options: [
    { name: 'target', type: 'User' },
    {
      name: 'size',
      type: 'Integer',
      choices: ALLOWED_SIZES
    }
  ],

  async run(lang) {
    const
      target = getTargetMembers(this, { returnSelf: true }),

      avatarURL = target.displayAvatarURL({
        size: this.options?.getInteger('size')
          ?? (ALLOWED_SIZES.includes(Number.parseInt(this.args?.at(-1))) ? this.args?.at(-1) : undefined)
          ?? ALLOWED_SIZES.at(-2) /* eslint-disable-line @typescript-eslint/no-magic-numbers -- 2nd largest resolution */
      }),
      averageColor = (await getAverageColor(target.displayAvatarURL())).hex,
      embed = new EmbedBuilder({
        description: bold(lang('embedDescription', target.user?.username ?? target.username)),
        image: { url: avatarURL },
        fields: [{
          name: lang('averageColor'), inline: true,
          value: hyperlink(averageColor, `https://www.color-hex.com/color/${averageColor.slice(1)}`)
        }],
        color: Number.parseInt(averageColor.slice(1), 16),
        footer: { text: this.user.username }
      }),
      component = new ActionRowBuilder({
        components: [new ButtonBuilder({
          label: lang('global.downloadButton'),
          url: avatarURL,
          style: ButtonStyle.Link
        })]
      });

    return this.customReply({ embeds: [embed], components: [component] });
  }
};