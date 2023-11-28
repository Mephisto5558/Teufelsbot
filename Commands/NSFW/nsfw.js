const
  { EmbedBuilder } = require('discord.js'),
  fetch = require('node-fetch');

/**@type {command}*/
module.exports = {
  name: 'nsfw',
  cooldowns: { guild: 0, user: 1000 },
  slashCommand: true,
  prefixCommand: true,
  ephemeralDefer: true,
  options: [{
    name: 'type',
    type: 'String',
    autocompleteOptions: [
      'hass', 'hmidriff', 'pgif', '4k', 'hentai', 'hneko', 'neko', 'hkitsune', 'anal', 'hanal',
      'gonewild', 'ass', 'pussy', 'thigh', 'hthigh', 'paizuri', 'tentacle', 'boobs', 'hboobs', 'yaoi'
    ],
    strictAutocomplete: true
  }],

  /**@this GuildInteraction|GuildMessage*/
  run: async function (lang) {
    const data = await fetch(`https://nekobot.xyz/api/image?type=${(this.options?.getString('type') || this.args?.[0] || 'hentai').toLowerCase()}`).then(e => e.json());
    if (!data?.success) {
      this.customReply(lang('error'));
      return log.error('NSFW Command API Error: ', JSON.stringify(data));
    }

    const embed = new EmbedBuilder({ color: data.color, image: { url: data.message } });

    if (!Math.floor(Math.random() * 10000)) embed.data.title = lang('embedTitle');

    return this.customReply({ embeds: [embed] });
  }
};