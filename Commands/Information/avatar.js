const
  { EmbedBuilder, Colors, ActionRowBuilder, ButtonBuilder, ButtonStyle, ALLOWED_SIZES } = require('discord.js'),
  { getTargetMember } = require('#Utils');

module.exports = new MixedCommand({
  cooldowns: { user: 1000 },
  dmPermission: true,
  options: [
    new CommandOption({ name: 'target', type: 'User' }),
    new CommandOption({
      name: 'size',
      type: 'Integer',
      choices: ALLOWED_SIZES
    })
  ],

  async run(lang) {
    const
      target = getTargetMember(this, { returnSelf: true }),
      avatarURL = target.displayAvatarURL({ size: this.options?.getInteger('size') ?? this.args?.last() ?? 2048 }),
      embed = new EmbedBuilder({
        description: lang('embedDescription', target.user?.username ?? target.username),
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
});