const
  { EmbedBuilder } = require('discord.js'),
  { get } = require('axios');

module.exports = {
  name: 'inpirobot',
  aliases: { prefix: [], slash: [] },
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 100 },
  category: 'Fun',
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,

  run: async function (lang) {
    let res;
    try { res = await get('https://inspirobot.me/api?generate=true'); }
    catch (err) {
      this.customReply(lang('error'));
      return this.client.error(err.message);
    }

    if (!res.data) return this.customReply(lang('notFound'));

    const embed = new EmbedBuilder({
      image: { url: res.data },
      footer: { text: '- inspirobot.me' }
    }).setColor('Random');

    this.customReply({ embeds: [embed] });
  }
};