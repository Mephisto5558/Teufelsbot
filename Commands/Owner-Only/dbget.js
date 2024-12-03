const
  { messageMaxLength } = require('#Utils').constants,
  suffix = '```';

module.exports = new PrefixCommand({
  dmPermission: true,
  options: [
    new CommandOption({
      name: 'database',
      type: 'String',
      required: true
    }),
    new CommandOption({ name: 'key', type: 'String' })
  ],
  beta: true,

  async run(lang) {
    const result = this.client.db.get(this.args[0], this.args[1]);

    if (!result) return this.customReply(lang('notFound'));
    return this.customReply('```json\n' + JSON.stringify(result, undefined, 2).slice(0, messageMaxLength - suffix.length) + `\n${suffix}`);
  }
});