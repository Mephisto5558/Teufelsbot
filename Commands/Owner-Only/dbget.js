const
  MAX_MESSAGE_LENGTH = 2000,
  suffix = '```';

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

    if (!result) return this.customReply(lang('notFound'));
    return this.customReply('```json\n' + JSON.stringify(result, undefined, 2).slice(0, MAX_MESSAGE_LENGTH - suffix.length) + `\n${suffix}`);
  }
};