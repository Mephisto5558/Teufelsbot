const
  { EmbedBuilder, Colors, ImageFormat } = require('discord.js'),
  { createCanvas, loadImage } = require('canvas'),
  { getTargetMember } = require('#Utils');

/** @type {command<'both'>}*/
module.exports = {
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

  run: async function (lang) {
    const
      type = (this.options?.getString('avatar_type') ?? 'server') == 'server',
      base = getTargetMember(this, { targetOptionName: 'base' }),
      overlay = this.options?.getMember('overlay') ?? this.mentions?.members.at(1) ?? this.member;

    if (!base || base.id == overlay.id) return this.customReply(lang('missingParam'));

    const embed = new EmbedBuilder({
      title: lang('embedTitle', { user1: base.displayName, user2: overlay.displayName }),
      color: Colors.White,
      footer: { text: this.user.tag }
    });

    if (base.id == overlay.id) {
      embed.data.image = { url: type == 'server' ? base.displayAvatarURL({ forceStatic: true, size: 512 }) : base.user.avatarURL({ forceStatic: true, size: 512 }) };
      return this.customReply({ embeds: [embed] });
    }

    const
      msg = await this.customReply({ embeds: [embed.setDescription(lang('global.loading', getEmoji('loading')))] }),
      baseAvatar = await loadImage((type == 'server' ? base : base.user).displayAvatarURL({ extension: ImageFormat.PNG, size: 512 })),
      overlayAvatar = await loadImage(overlay.displayAvatarURL({ extension: ImageFormat.PNG, size: 512 })),
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