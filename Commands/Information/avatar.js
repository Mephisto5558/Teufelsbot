const
  { EmbedBuilder, Colors, ActionRowBuilder, ButtonBuilder, ButtonStyle, ALLOWED_SIZES, bold } = require('discord.js'),
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
      embed = new EmbedBuilder({
        description: bold(lang('embedDescription', target.user?.username ?? target.username)),
        color: Colors.White,
        image: { url: avatarURL },
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