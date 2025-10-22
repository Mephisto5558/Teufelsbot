const
  { ALLOWED_SIZES, Colors, EmbedBuilder, ImageFormat } = require('discord.js'),
  { Canvas, loadImage } = require('skia-canvas'),
  { getTargetMembers, toMs: { secToMs } } = require('#Utils'),
  IMAGE_SIZE = ALLOWED_SIZES[5]; /* eslint-disable-line @typescript-eslint/no-magic-numbers */

/** @type {command<'both'>} */
module.exports = {
  cooldowns: { user: secToMs(2) },
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

  async run(lang) {
    const
      type = (this.options?.getString('avatar_type') ?? 'server') == 'server',
      [base, overlay] = getTargetMembers(this, [{ targetOptionName: 'base' }, { targetOptionName: 'overlay', returnSelf: true }]);

    if (!base || !overlay || base.id == overlay.id) return this.customReply(lang('missingParam'));

    const embed = new EmbedBuilder({
      title: lang('embedTitle', { user1: base.displayName, user2: overlay.displayName }),
      color: Colors.White,
      footer: { text: this.user.tag }
    });

    if (base.id == overlay.id) {
      embed.data.image = {
        url: type == 'server'
          ? base.displayAvatarURL({ forceStatic: true, size: IMAGE_SIZE })
          : base.user.avatarURL({ forceStatic: true, size: IMAGE_SIZE })
      };
      return this.customReply({ embeds: [embed] });
    }

    const
      msg = await this.customReply({ embeds: [embed.setDescription(lang('global.loading', getEmoji('loading')))] }),
      baseAvatar = await loadImage((type == 'server' ? base : base.user).displayAvatarURL({ extension: ImageFormat.PNG, size: IMAGE_SIZE })),
      overlayAvatar = await loadImage(overlay.displayAvatarURL({ extension: ImageFormat.PNG, size: IMAGE_SIZE })),
      canvas = new Canvas(baseAvatar.width, baseAvatar.height),
      ctx = canvas.getContext('2d');

    ctx.globalAlpha = 0.5; /* eslint-disable-line @typescript-eslint/no-magic-numbers */
    ctx.drawImage(baseAvatar, 0, 0);
    ctx.drawImage(overlayAvatar, 0, 0, baseAvatar.width, baseAvatar.height);

    delete embed.data.description;
    embed.data.image = { url: `attachment://${this.commandName}.png` };

    return msg.edit({ embeds: [embed], files: [{ attachment: await canvas.toBuffer(), name: `${this.commandName}.png` }] });
  }
};