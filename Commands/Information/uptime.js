const
  { EmbedBuilder, Colors, hyperlink } = require('discord.js'),
  { timeFormatter, msInSecond } = require('#Utils').timeFormatter;

/** @type {command<'both', false>} */
module.exports = {
  cooldowns: { channel: msInSecond / 10 },
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,

  async run(lang) {
    const embed = new EmbedBuilder({
      description: lang(
        this.client.config.website.domain && !this.client.config.disableWebserver ? 'embedDescription' : 'embedDescriptionNoURL',
        { time: timeFormatter(Date.now() - process.uptime() * msInSecond, lang).formatted, link: hyperlink(lang('online'), `${this.client.config.website.domain}/uptime`) }
      ),
      color: Colors.White
    });

    return this.customReply({ embeds: [embed] });
  }
};