const { EmbedBuilder, Colors, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

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

  run: async function (lang) {
    const
      target = this.options?.getMember('target') || this.options?.getUser('target') || (this.mentions?.members || this.mentions?.users)?.first() || this.guild?.members.cache.find(e => [e.user.id, e.user.username, e.user.globalName, e.nickname].some(e => [...(this.args || []), this.content].includes(e))) || this.member || this.user,
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