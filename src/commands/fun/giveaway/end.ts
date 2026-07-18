import { OptionType } from '@mephisto5558/command';
import { giveawaySubcommand } from './index.ts';


export default giveawaySubcommand({
  name: 'end',
  type: OptionType.Subcommand,
  options: [{
    name: 'id',
    type: OptionType.String,
    required: true
  }],

  async run(lang, { components, giveawayId }) {
    components[0]!.components[0]!.setURL(this.client.giveawaysManager!.giveaways.find(e => e.messageId = giveawayId).messageURL);
    await this.client.giveawaysManager!.end(giveawayId);

    return this.editReply({ content: lang('ended'), components });
  }
});