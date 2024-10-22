const
  { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js'),
  fetch = require('node-fetch').default;

module.exports = new MixedCommand({
  usage: {
    usage: '["en" | "de"]',
    examples: 'fact en'
  },
  cooldowns: { channel: 100 },
  dmPermission: true,

  async run(lang) {
    const
      data = await fetch(`https://uselessfacts.jsph.pl/api/v2/facts/random?language=${lang.__boundArgs__[0].locale}`).then(e => e.json()),
      embed = new EmbedBuilder({
        title: lang('embedTitle'),
        description: `${data.text}\n\nSource: [${data.source}](${data.source_url})`,
        footer: { text: '- https://uselessfacts.jsph.pl' }
      }).setColor('Random'),
      component = new ActionRowBuilder({
        components: [new ButtonBuilder({
          label: lang('global.anotherone'),
          customId: 'fact',
          style: ButtonStyle.Primary
        })]
      });

    return this.customReply({ embeds: [embed], components: [component] });
  }
});