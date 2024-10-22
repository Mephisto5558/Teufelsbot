const
  { EmbedBuilder, Colors } = require('discord.js'),
  { timeFormatter } = require('#Utils');

module.exports = new MixedCommand({
  dmPermission: true,

  async run(lang) {
    const embed = new EmbedBuilder({
      description: lang(
        this.client.config.website.domain && !this.client.config.disableWebserver ? 'embedDescription' : 'embedDescriptionNoURL',
        { time: timeFormatter({ sec: process.uptime(), lang }).formatted, domain: this.client.config.website.domain }
      ),
      color: Colors.White
    });

    return this.customReply({ embeds: [embed] });
  }
});