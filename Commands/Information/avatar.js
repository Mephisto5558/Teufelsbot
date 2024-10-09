const
  { EmbedBuilder, Colors, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js'),
  { getTargetMember } = require('#Utils');

module.exports = new MixedCommand({
  cooldowns: { user: 1000 },
  dmPermission: true,
  options: [
    new CommandOption({ name: 'target', type: 'User' }),
    new CommandOption({
      name: 'size',
      type: 'Integer',
      choices: [16, 32, 56, 64, 96, 128, 256, 300, 512, 600, 1024, 2048]
    })
  ],

  run: async function (lang) {
    const
      target = getTargetMember(this, { returnSelf: true }),
      avatarURL = target.displayAvatarURL({ size: this.options?.getInteger('size') ?? this.args?.at(-1) ?? 2048 }),
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