import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { AllContexts, Command, CommandType } from '@mephisto5558/command';
import { commonHeaders } from '#utils'.constants;

/** @type {(client: Client) => Promise<{ slip: { id: number, advice: string } }>} */
const fetchAPI = async client => (await fetch('https://api.adviceslip.com/advice', {
  headers: commonHeaders(client)
})).json();

export default new Command({
  types: [CommandType.Slash, CommandType.Prefix],
  contexts: AllContexts,

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