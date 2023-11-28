const
  { default: fetch, FetchError } = require('node-fetch'),
  { EmbedBuilder } = require('discord.js');

/**@type {command}*/
module.exports = {
  name: 'inspirobot',
  cooldowns: { user: 1000 },
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,

  run: async function (lang) {
    let res;
    try { res = await fetch('https://inspirobot.me/api?generate=true').then(e => e.text()); }
    catch (err) {
      if (!(err instanceof FetchError)) throw err;
      await this.customReply(lang('error'));
      return log.error(err.message);
    }

    if (!res) return this.customReply(lang('notFound'));

    const embed = new EmbedBuilder({
      image: { url: res },
      footer: { text: '- inspirobot.me' }
    }).setColor('Random');

    return this.customReply({ embeds: [embed] });
  }
};