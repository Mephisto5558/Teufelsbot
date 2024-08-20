const
  { EmbedBuilder, Colors } = require('discord.js'),
  { timeFormatter } = require('#Utils');

/** @type {command<'both', false>}*/
module.exports = {
  cooldowns: { channel: 100 },
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,

  run: async function (lang) {
    const embed = new EmbedBuilder({
      description: lang(
        this.client.config.website.domain && !this.client.config.disableWebserver ? 'embedDescription' : 'embedDescriptionNoURL',
        { time: timeFormatter({ sec: process.uptime(), lang }).formatted, domain: this.client.config.website.domain }
      ),
      color: Colors.White
    });

    return this.customReply({ embeds: [embed] });
  }
};