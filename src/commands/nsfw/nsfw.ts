import { EmbedBuilder } from 'discord.js';
import { randomInt } from 'node:crypto';
import { Command, CommandType, CooldownType, OptionType } from '@mephisto5558/command';
import { commonHeaders } from '#utils/constants.ts';

const secretChance = 1e4; // 1 in 10_000

export default new Command({
  types: [CommandType.Slash, CommandType.Prefix],
  usage: { examples: 'hentai' },
  cooldowns: { [CooldownType.User]: '1s' },
  ephemeralDefer: true,
  options: [{
    name: 'type',
    type: OptionType.String,
    autocompleteOptions: [
      'hass', 'hmidriff', 'pgif', '4k', 'hentai', 'hneko', 'hkitsune', 'anal', 'hanal',
      'gonewild', 'ass', 'pussy', 'thigh', 'hthigh', 'paizuri', 'tentacle', 'boobs', 'hboobs', 'yaoi'
    ],
    strictAutocomplete: true
  }],

  async run(lang) {
    const data = await fetch(`https://nekobot.xyz/api/image?type=${(this.options?.getString('type') ?? this.args?.[0] ?? 'hentai').toLowerCase()}`, {
      headers: commonHeaders(this.client)
    }).then(async e => e.json()) as { success: boolean, message: string, color: number };

    if (!data.success) {
      void this.customReply(lang('error'));
      return log.error('NSFW Command API Error: ', JSON.stringify(data));
    }

    const embed = new EmbedBuilder({ color: data.color, image: { url: data.message } });

    if (!randomInt(secretChance)) embed.data.title = lang('embedTitle');

    return this.customReply({ embeds: [embed] });
  }
});