import { ALLOWED_SIZES, Colors, EmbedBuilder, ImageFormat } from 'discord.js';
import { Command, CommandType, CooldownType, OptionType } from '@mephisto5558/command';
/* eslint-disable-next-line import-x/no-unresolved -- false positive */
import { Canvas, loadImage } from 'skia-canvas';
import { getTargetMembers } from '#utils';


const IMAGE_SIZE = ALLOWED_SIZES[5]; /* eslint-disable-line @typescript-eslint/no-magic-numbers -- 512 */

export default new Command({
  types: [CommandType.Slash, CommandType.Prefix],
  cooldowns: { [CooldownType.User]: '2s' },
  options: [
    {
      name: 'base',
      type: OptionType.User,
      required: true
    },
    { name: 'overlay', type: OptionType.User },
    {
      name: 'avatar_type',
      type: OptionType.String,
      choices: ['server', 'global']
    }
  ],

  async run(lang) {
    const
      isGuild = (this.options?.getString('avatar_type') ?? 'server') == 'server',
      [base, overlay] = getTargetMembers(this, [{ targetOptionName: 'base' }, { targetOptionName: 'overlay', returnSelf: true }]);

    if (!base || base.id == overlay.id) return this.customReply(lang('missingParam'));

    const embed = new EmbedBuilder({
      title: lang('embedTitle', { user1: base.displayName, user2: overlay.displayName }),
      color: Colors.White,
      footer: { text: this.user.tag }
    });

    if (base.id == overlay.id) {
      embed.data.image = {
        url: isGuild
          ? base.displayAvatarURL({ forceStatic: true, size: IMAGE_SIZE })
          : base.user.avatarURL({ forceStatic: true, size: IMAGE_SIZE })
      };
      return this.customReply({ embeds: [embed] });
    }

    const
      msg = await this.customReply({ embeds: [embed.setDescription(lang('global.loading', this.client.application.getEmoji('loading')))] }),
      baseAvatar = await loadImage(base.user.displayAvatarURL({ extension: ImageFormat.PNG, size: IMAGE_SIZE })),
      overlayAvatar = await loadImage(overlay.displayAvatarURL({ extension: ImageFormat.PNG, size: IMAGE_SIZE })),
      canvas = new Canvas(baseAvatar.width, baseAvatar.height),
      ctx = canvas.getContext('2d');

    ctx.globalAlpha = 0.5; /* eslint-disable-line @typescript-eslint/no-magic-numbers -- makes the images look-through */
    ctx.drawImage(baseAvatar, 0, 0);
    ctx.drawImage(overlayAvatar, 0, 0, baseAvatar.width, baseAvatar.height);

    delete embed.data.description;
    embed.data.image = { url: `attachment://${this.commandName}.png` };

    return msg.edit({ embeds: [embed], files: [{ attachment: await canvas.toBuffer(), name: `${this.commandName}.png` }] });
  }
});