module.exports = {
  name: 'dbget',
  aliases: { prefix: [], slash: [] },
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 0 },
  category: 'Owner-Only',
  slashCommand: false,
  prefixCommand: true,
  beta: true,

  run: function (lang, { db }) {
    const result = db.get(this.content);

    if (!result) return this.customReply(lang('notFound'));
    this.customReply('```json\n' + JSON.stringify(result, null, 2).substring(0, 1987) + '\n```');
  }
};