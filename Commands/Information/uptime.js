const
  { Colors, EmbedBuilder, hyperlink } = require('discord.js'),
  { Command, commandTypes } = require('@mephisto5558/command'),
  { timeFormatter: { timeFormatter }, toMs: { secToMs } } = require('#Utils');

module.exports = new Command({
  types: [commandTypes.slash, commandTypes.prefix],
  cooldowns: { channel: '100ms' },
  dmPermission: true,

  async run(lang) {
    const
      { website: { domain, port, uptime }, disableWebserver } = this.client.config,

      embed = new EmbedBuilder({
        description: lang(
          domain && uptime && !disableWebserver ? 'embedDescription' : 'embedDescriptionNoURL', domain && uptime && !disableWebserver && {
            time: timeFormatter(Date.now() - secToMs(process.uptime()), lang).formatted,
            link: hyperlink(lang('online'), domain + (port ? `:${port}` : '') + `/${uptime}`)
          }
        ),
        color: Colors.White
      });

    return this.customReply({ embeds: [embed] });
  }
});