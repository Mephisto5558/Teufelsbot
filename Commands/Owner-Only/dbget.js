const { codeBlock } = require('discord.js');

/** @type {command<'prefix', false>}*/
module.exports = {
  slashCommand: false,
  prefixCommand: true,
  dmPermission: true,
  options: [
    {
      name: 'database',
      type: 'String',
      required: true
    },
    { name: 'key', type: 'String' }
  ],
  beta: true,

  async run(lang) {
    const result = this.client.db.get(this.args[0], this.args[1]);
    return this.customReply(result ? codeBlock('json', JSON.stringify(result, undefined, 2)) : lang('notFound'));
  }
};