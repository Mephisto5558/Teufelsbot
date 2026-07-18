import { OptionType } from '@mephisto5558/command';
import { giveawaySubcommand } from './index.ts';


export default giveawaySubcommand({
  name: 'reroll',
  type: OptionType.Subcommand,
  options: [{
    name: 'id',
    type: OptionType.String,
    required: true
  }],

  async run(lang, { components, giveawayId }) {
    const rerollOptions = {
      messages: {
        congrat: { content: lang('rerollWinners'), components },
        error: { content: lang('rerollNoWinner'), components }
      }
    };

    components[0]!.components[0]!.setURL(this.client.giveawaysManager!.giveaways.find(e => e.messageId = giveawayId).messageURL);
    await this.client.giveawaysManager!.reroll(giveawayId, rerollOptions);

    return this.editReply({ content: lang('rerolled'), components });
  }
});