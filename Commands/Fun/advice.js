const
  { EmbedBuilder } = require('discord.js'),
  fetch = require('node-fetch').default;

module.exports = {
  name: 'advice',
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,beta:true,

  run: async function (lang) {
    const embed = new EmbedBuilder({
      title: lang('embedTitle'),
      description: (await fetch('https://api.adviceslip.com/advice').then(res => res.json())).slip.advice,
      footer: { text: '- https://api.adviceslip.com' }
    }).setColor('Random');

    return this.customReply({ embeds: [embed] });
  }
};