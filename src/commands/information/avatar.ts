import { ALLOWED_SIZES, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, bold, hyperlink } from 'discord.js';
import { AllContexts, Command, CommandType, CooldownType, OptionType } from '@mephisto5558/command';
import { getAverageColor } from 'fast-average-color-node';
import { getTargetMembers } from '#utils';

export default new Command({
  types: [CommandType.Slash, CommandType.Prefix],
  cooldowns: { [CooldownType.User]: '1s' },
  contexts: AllContexts,
  options: [
    { name: 'target', type: OptionType.User },
    {
      name: 'size',
      type: OptionType.Integer,
      choices: ALLOWED_SIZES
    }
  ],

  async run(lang) {
    const
      target = getTargetMembers(this, [{ returnSelf: true }]),
      avatarURL = target.displayAvatarURL({
        size: this.options?.getInteger('size')
          ?? (ALLOWED_SIZES.includes(Number.parseInt(this.args?.at(-1), 10)) ? this.args?.at(-1) : undefined)
          ?? ALLOWED_SIZES.at(-2) /* eslint-disable-line @typescript-eslint/no-magic-numbers -- 2nd largest resolution */
      }),
      averageColor = (await getAverageColor(target.displayAvatarURL())).hex,
      embed = new EmbedBuilder({
        description: bold(lang('embedDescription', target.user.username)),
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
});