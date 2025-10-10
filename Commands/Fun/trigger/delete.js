/** @import subcommand from '.' */

const
  { inlineCode } = require('discord.js'),
  { findTriggerId, triggerQuery } = require('./_utils');

/** @type {subcommand} */
module.exports = {
  options: [{
    name: 'query_or_id',
    type: 'String',
    autocompleteOptions: triggerQuery
  }],

  async run(lang, { oldData, query }) {
    const id = query ? Number(findTriggerId(query, oldData) ?? -1) : Math.max(...Object.keys(oldData).map(Number));
    if (id < 0) return this.editReply(lang('noneFound'));

    await this.guild.deleteDB(`triggers.${id}`);
    return this.editReply(lang('deletedOne', inlineCode(id)));
  }
};