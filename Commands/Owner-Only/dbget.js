/**@type {command}*/
module.exports = {
  name: 'dbget',
  slashCommand: false,
  prefixCommand: true,
  dmPermission: true,
  beta: true,

  /**@this Message*/
  run: function (lang) {
    const result = this.client.db.get(this.args[0], this.args[1]);

    if (!result) return this.customReply(lang('notFound'));
    return this.customReply('```json\n' + JSON.stringify(result, null, 2).substring(0, 1987) + '\n```');
  }
};