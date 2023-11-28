const
  { EmbedBuilder, Colors } = require('discord.js'),
  { createCanvas, loadImage } = require('canvas'),
  { getTarget } = require('../../Utils');

/**@type {command}*/
module.exports = {
  name: 'avatarfusion',
  cooldowns: { user: 2000 },
  slashCommand: true,
  prefixCommand: true,
  options: [
    {
      name: 'base',
      type: 'User',
      required: true
    },
    { name: 'overlay', type: 'User' },
    {
      name: 'avatar_type',
      type: 'String',
      choices: ['server', 'global']
    }
  ],

  /**@this GuildInteraction|GuildMessage*/
  run: async function (lang) {
    const
      type = (this.options?.getString('avatar_type') || 'server') == 'server',
      base = getTarget.call(this, { targetOptionName: 'base' }),
      overlay = this.options?.getMember('overlay') || this.mentions?.members.at(1) || this.member;

    if (!base) return this.customReply(lang('missingParam'));

    const embed = new EmbedBuilder({
      title: lang('embedTitle', { user1: base.user.customTag, user2: overlay.user.customTag }),
      color: Colors.White,
      footer: { text: this.user.tag }
    });

    if (base.id == overlay.id) {
      embed.data.image = { url: type == 'server' ? base.displayAvatarURL({ forceStatic: true, size: 512 }) : base.user.avatarURL({ forceStatic: true, size: 512 }) };
      return this.customReply({ embeds: [embed] });
    }
    else embed.data.description = lang('global.loading');

    const
      msg = await this.customReply({ embeds: [embed] }),
      baseAvatar = await loadImage(`https://cdn.discordapp.com/avatars/${base.id}/${type == 'server' && base.avatar || base.user.avatar}.png?size=512`),
      overlayAvatar = await loadImage(`https://cdn.discordapp.com/avatars/${overlay.id}/${type == 'server' && overlay.avatar || overlay.user.avatar}.png?size=512`),
      canvas = createCanvas(baseAvatar.width, baseAvatar.height),
      ctx = canvas.getContext('2d');

    ctx.globalAlpha = 0.5;
    ctx.drawImage(baseAvatar, 0, 0);
    ctx.drawImage(overlayAvatar, 0, 0, baseAvatar.width, baseAvatar.height);

    delete embed.data.description;
    embed.data.image = { url: 'attachment://avatarfusion.png' };

    return msg.edit({ embeds: [embed], files: [{ attachment: canvas.toBuffer(), name: 'avatarfusion.png' }] });
  }
};