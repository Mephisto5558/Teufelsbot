const
  { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, hyperlink } = require('discord.js'),
  { Command, commandTypes } = require('@mephisto5558/command'),
  fetch = require('node-fetch').default,
  { constants: { commonHeaders } } = require('#Utils');

module.exports = new Command({
  types: [commandTypes.slash, commandTypes.prefix],
  usage: {
    usage: '["en" | "de"]',
    examples: 'fact en'
  },
  cooldowns: { channel: '100ms' },
  dmPermission: true,

  async run(lang) {
    const

      /** @type {{ text: string, source: string, source_url: string }} */
      data = await fetch(`https://uselessfacts.jsph.pl/api/v2/facts/random?language=${lang.config.locale}`, {
        headers: commonHeaders(this.client)
      }).then(async e => e.json()),
      embed = new EmbedBuilder({
        title: lang('embedTitle'),
        description: `${data.text}\n\nSource: ${hyperlink(data.source, data.source_url)}`,
        footer: { text: '- https://uselessfacts.jsph.pl' }
      }).setColor('Random'),
      component = new ActionRowBuilder({
        components: [new ButtonBuilder({
          label: lang('global.anotherone'),
          customId: this.commandName,
          style: ButtonStyle.Primary
        })]
      });

    return this.customReply({ embeds: [embed], components: [component] });
  }
});