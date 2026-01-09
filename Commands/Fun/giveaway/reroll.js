/** @import GiveawaySubcommand from './index' */

const { CommandOption } = require('@mephisto5558/command');

/** @type {GiveawaySubcommand} */
module.exports = new CommandOption({
  name: 'reroll',
  type: 'Subcommand',
  options: [{
    name: 'id',
    type: 'String',
    required: true
  }],

  async run(lang, { components, giveawayId }) {
    const rerollOptions = {
      messages: {
        congrat: { content: lang('rerollWinners'), components },
        error: { content: lang('rerollNoWinner'), components }
      }
    };

    components[0].components[0].setURL(this.client.giveawaysManager.giveaways.find(e => e.messageId = giveawayId).messageURL);
    await this.client.giveawaysManager.reroll(giveawayId, rerollOptions);

    return this.editReply({ content: lang('rerolled'), components });
  }
});