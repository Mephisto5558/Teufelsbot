/** @type {import('.')} */
module.exports = {
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

    await this.client.giveawaysManager.reroll(giveawayId, rerollOptions);
    components[0].components[0].setURL(giveawayId);

    return this.editReply({ content: lang('rerolled'), components });
  }
};