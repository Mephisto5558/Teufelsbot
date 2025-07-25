/** @type {import('.')} */
module.exports = {
  options: [{
    name: 'id',
    type: 'String',
    required: true
  }],

  async run(lang, components, { giveawayId }) {
    const rerollOptions = {
      messages: {
        congrat: { content: lang('rerollWinners'), components },
        error: { content: lang('rerollNoWinner'), components }
      }
    };

    await this.client.giveawaysManager.reroll(giveawayId, rerollOptions).then(() => {
      components[0].components[0].data.url = giveawayId; // using .then() here to prevent `eslint/require-atomic-updates`
    });

    return this.editReply({ content: lang('rerolled'), components });
  }
};