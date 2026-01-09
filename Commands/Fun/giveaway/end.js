/** @import GiveawaySubcommand from './index' */

const { CommandOption } = require('@mephisto5558/command');

/** @type {GiveawaySubcommand} */
module.exports = new CommandOption({
  name: 'end',
  type: 'Subcommand',
  options: [{
    name: 'id',
    type: 'String',
    required: true
  }],

  async run(lang, { components, giveawayId }) {
    components[0].components[0].setURL(this.client.giveawaysManager.giveaways.find(e => e.messageId = giveawayId).messageURL);
    await this.client.giveawaysManager.end(giveawayId);

    return this.editReply({ content: lang('ended'), components });
  }
});