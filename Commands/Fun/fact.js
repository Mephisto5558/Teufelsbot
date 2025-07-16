const
  { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, hyperlink } = require('discord.js'),
  fetch = require('node-fetch').default,
  { msInSecond } = require('#Utils').timeFormatter;

/** @type {command<'both', false>} */
module.exports = {
  usage: {
    usage: '["en" | "de"]',
    examples: 'fact en'
  },
  cooldowns: { channel: msInSecond / 10 },
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,

  async run(lang) {
    const

      /** @type {{ text: string, source: string, source_url: string }} */
      data = await fetch(`https://uselessfacts.jsph.pl/api/v2/facts/random?language=${lang.__boundArgs__[0].locale}`).then(e => e.json()),
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
};