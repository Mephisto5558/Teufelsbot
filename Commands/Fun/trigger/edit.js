const
  { inlineCode } = require('discord.js'),
  { triggerQuery, findTriggerId } = require('./_utils');

/** @type {import('.').default} */
module.exports = {
  options: [
    {
      name: 'query_or_id',
      type: 'String',
      autocompleteOptions: triggerQuery
    },
    { name: 'trigger', type: 'String' },
    { name: 'response', type: 'String' },
    { name: 'wildcard', type: 'Boolean' }
  ],

  async run(lang, { oldData, query }) {
    if (!oldData.__count__) return this.editReply(lang('noneFound'));

    const
      id = findTriggerId(query, oldData),
      /** @type {import('.').triggersArray[1]} */ { trigger, response, wildcard } = query ? oldData[id] : undefined;

    if (!trigger) return this.editReply(lang('notFound'));

    const data = {
      trigger: this.options.getString('trigger') ?? trigger,
      response: this.options.getString('response')?.replaceAll('/n', '\n') ?? response,
      wildcard: this.options.getBoolean('wildcard') ?? wildcard
    };

    await this.guild.updateDB(`triggers.${id}`, data);
    return this.editReply(lang('edited', inlineCode(data.trigger)));
  }
};