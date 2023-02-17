const
  fetch = require('node-fetch').default,
  { EmbedBuilder } = require('discord.js');

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
      await this.customReply(lang('error'));
      return this.client.error(err.message);
    }

    if (!res) return this.customReply(lang('notFound'));

    const embed = new EmbedBuilder({
      image: { url: res },
      footer: { text: '- inspirobot.me' }
    }).setColor('Random');

    return this.customReply({ embeds: [embed] });
  }
};