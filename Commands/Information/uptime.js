const
  { Colors, EmbedBuilder, hyperlink } = require('discord.js'),
  { timeFormatter, msInSecond } = require('#Utils').timeFormatter;

/** @type {command<'both', false>} */
module.exports = {
  cooldowns: { channel: msInSecond / 10 },
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,

  async run(lang) {
    const
      { website: { domain, port, uptime }, disableWebserver } = this.client.config,

      embed = new EmbedBuilder({
        description: lang(
          domain && uptime && !disableWebserver ? 'embedDescription' : 'embedDescriptionNoURL', domain && uptime && !disableWebserver && {
            time: timeFormatter(Date.now() - process.uptime() * msInSecond, lang).formatted,
            link: hyperlink(lang('online'), domain + (port ? `:${port}` : '') + `/${uptime}`)
          }
        ),
        color: Colors.White
      });

    return this.customReply({ embeds: [embed] });
  }
};