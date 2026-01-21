const
  { EmbedBuilder } = require('discord.js'),
  { randomInt } = require('node:crypto'),
  { Command, commandTypes } = require('@mephisto5558/command'),
  fetch = require('node-fetch').default,
  { timeFormatter: { msInSecond }, constants: { commonHeaders } } = require('#Utils'),

  secretChance = 1e4; // 1 in 10_000

module.exports = new Command({
  types: [commandTypes.slash, commandTypes.prefix],
  usage: { examples: 'hentai' },
  cooldowns: { user: msInSecond },
  ephemeralDefer: true,
  options: [{
    name: 'type',
    type: 'String',
    autocompleteOptions: [
      'hass', 'hmidriff', 'pgif', '4k', 'hentai', 'hneko', 'hkitsune', 'anal', 'hanal',
      'gonewild', 'ass', 'pussy', 'thigh', 'hthigh', 'paizuri', 'tentacle', 'boobs', 'hboobs', 'yaoi'
    ],
    strictAutocomplete: true
  }],

  async run(lang) {
    /** @type {{ success: boolean, message: string, color: number }} */
    const data = await fetch(`https://nekobot.xyz/api/image?type=${(this.options?.getString('type') ?? this.args?.[0] ?? 'hentai').toLowerCase()}`, {
      headers: commonHeaders(this.client)
    }).then(async e => e.json());

    if (!data.success) {
      void this.customReply(lang('error'));
      return log.error('NSFW Command API Error: ', JSON.stringify(data));
    }

    const embed = new EmbedBuilder({ color: data.color, image: { url: data.message } });

    if (!randomInt(secretChance)) embed.data.title = lang('embedTitle');

    return this.customReply({ embeds: [embed] });
  }
});