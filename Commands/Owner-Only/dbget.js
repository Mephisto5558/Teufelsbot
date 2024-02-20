/** @type {command<'prefix', false>}*/
module.exports = {
  name: 'dbget',
  slashCommand: false,
  prefixCommand: true,
  dmPermission: true,
  beta: true,

  run: function (lang) {
    const result = this.client.db.get(this.args[0], this.args[1]);

    if (!result) return this.customReply(lang('notFound'));
    return this.customReply('```json\n' + JSON.stringify(result, undefined, 2).slice(0, 1987) + '\n```');
  }
};