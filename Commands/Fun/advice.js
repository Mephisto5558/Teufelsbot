const
  { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js'),
  { Command } = require('@mephisto5558/command'),
  fetch = require('node-fetch').default,
  { commonHeaders } = require('#Utils').constants,

  /** @type {(client: Client) => Promise<{slip: {id: number, advice: string}}>} */
  fetchAPI = async client => (await fetch('https://api.adviceslip.com/advice', {
    headers: commonHeaders(client)
  })).json();

module.exports = new Command({
  types: ['slash', 'prefix'],
  dmPermission: true,

  async run(lang) {
    const
      embed = new EmbedBuilder({
        title: lang('embedTitle'),
        description: (await fetchAPI(this.client)).slip.advice,
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
});