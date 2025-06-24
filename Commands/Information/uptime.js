const
  { EmbedBuilder, Colors, hyperlink } = require('discord.js'),
  { timeFormatter, msInSecond } = require('#Utils').timeFormatter;

module.exports = new MixedCommand({
  cooldowns: { channel: msInSecond / 10 },
  dmPermission: true,

  async run(lang) {
    const { website: { domain, port = 0, uptime }, disableWebserver } = this.client.config;

    const embed = new EmbedBuilder({
      description: lang(
        domain && uptime && !disableWebserver ? 'embedDescription' : 'embedDescriptionNoURL', {
          time: timeFormatter(Date.now() - process.uptime() * msInSecond, lang).formatted,
          link: hyperlink(lang('online'), `${domain}${port ? ':' + port : ''}/${uptime}`)
        }
      ),
      color: Colors.White
    });

    return this.customReply({ embeds: [embed] });
  }
});