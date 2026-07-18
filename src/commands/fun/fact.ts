import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, hyperlink } from 'discord.js';
import { AllContexts, Command, CommandType, CooldownType } from '@mephisto5558/command';
import { commonHeaders } from '#utils/constants';


export default new Command({
  types: [CommandType.Slash, CommandType.Prefix],
  usage: {
    usage: '["en" | "de"]',
    examples: 'fact en'
  },
  cooldowns: { [CooldownType.Channel]: '100ms' },
  contexts: AllContexts,

  async run(lang) {
    const
      data = await (await fetch(`https://uselessfacts.jsph.pl/api/v2/facts/random?language=${lang.config.locale}`, {
        headers: commonHeaders(this.client)
      })).json() as { text: string; source: string; source_url: string },
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