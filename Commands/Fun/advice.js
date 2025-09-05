const
  { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js'),
  fetch = require('node-fetch').default,

  /** @type {() => Promise<{slip: {id: number, advice: string}}>} */
  fetchAPI = async () => (await fetch('https://api.adviceslip.com/advice')).json();

/** @type {command<'both', false>} */
module.exports = {
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,

  async run(lang) {
    const
      embed = new EmbedBuilder({
        title: lang('embedTitle'),
        description: (await fetchAPI()).slip.advice,
        footer: { text: '- https://api.adviceslip.com' }
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