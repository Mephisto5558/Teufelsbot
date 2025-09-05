/** @type {import('.')} */
module.exports = {
  options: [{
    name: 'id',
    type: 'String',
    required: true
  }],

  async run(lang, { components, giveawayId }) {
    const data = await this.client.giveawaysManager.end(giveawayId);
    components[0].components[0].setURL(data.messageURL);

    return this.editReply({ content: lang('ended'), components });
  }
};