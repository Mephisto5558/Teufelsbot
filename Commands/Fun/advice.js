const
  { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js'),
  fetch = require('node-fetch').default,

  /** @type {(client: Client) => Promise<{slip: {id: number, advice: string}}>} */
  fetchAPI = async client => (await fetch('https://api.adviceslip.com/advice', {
    headers: {
      'User-Agent': `Discord Bot ${client.application.name ?? ''} (${client.config.github.repo ?? ''})`,
      Accept: 'application/json'
    }
  })).json();

/** @type {command<'both', false>} */
module.exports = {
  slashCommand: true,
  prefixCommand: true,
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
};