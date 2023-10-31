const
  { EmbedBuilder, Colors, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js'),
  { getTarget } = require('../../Utils');

module.exports = {
  name: 'avatar',
  cooldowns: { guild: 100, user: 1000 },
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,
  options: [
    { name: 'target', type: 'User' },
    {
      name: 'size',
      type: 'Integer',
      choices: [16, 32, 56, 64, 96, 128, 256, 300, 512, 600, 1024, 2048]
    }
  ],

  /**@this Interaction|Message @param {lang}lang*/
  run: async function (lang) {
    const
      target = getTarget({ returnSelf: true }),
      avatarURL = await target.displayAvatarURL({ size: this.options?.getInteger('size') || 2048 }),
      embed = new EmbedBuilder({
        description: lang('embedDescription', target.user?.username || target.username),
        color: Colors.White,
        image: { url: avatarURL },
        footer: { text: this.user.username }
      }),
      component = new ActionRowBuilder({
        components: [new ButtonBuilder({
          label: lang('downloadButton'),
          url: avatarURL,
          style: ButtonStyle.Link
        })]
      });

    return this.customReply({ embeds: [embed], components: [component] });
  }
};