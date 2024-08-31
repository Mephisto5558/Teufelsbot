const
  { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js'),
  fetch = require('node-fetch').default;

module.exports = new MixedCommand({
  dmPermission: true,

  run: async function (lang) {
    const
      embed = new EmbedBuilder({
        title: lang('embedTitle'),
        description: (await fetch('https://api.adviceslip.com/advice').then(res => res.json())).slip.advice,
        footer: { text: '- https://api.adviceslip.com' }
      }).setColor('Random'),
      component = new ActionRowBuilder({
        components: [new ButtonBuilder({
          label: lang('global.anotherone'),
          customId: 'advice',
          style: ButtonStyle.Primary
        })]
      });

    return this.customReply({ embeds: [embed], components: [component] });
  }
});