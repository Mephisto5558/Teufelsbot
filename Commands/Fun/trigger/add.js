const { inlineCode } = require('discord.js');

/** @type {import('.').default} */
module.exports = {
  options: [
    {
      name: 'trigger',
      type: 'String',
      required: true
    },
    {
      name: 'response',
      type: 'String',
      required: true
    },
    { name: 'wildcard', type: 'Boolean' }
  ],

  async run(lang, oldData) {
    const
      id = Math.max(...Object.keys(oldData).map(Number), 0) || 0 + 1,
      data = {
        trigger: this.options.getString('trigger', true),
        response: this.options.getString('response', true).replaceAll('/n', '\n'),
        wildcard: !!this.options.getBoolean('wildcard')
      };

    await this.guild.updateDB(`triggers.${id}`, data);
    return this.editReply(lang('saved', inlineCode(data.trigger)));
  }
};