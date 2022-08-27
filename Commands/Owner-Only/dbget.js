module.exports = {
  name: 'dbget',
  aliases: { prefix: [], slash: [] },
  description: 'query data from the database',
  usage: 'PREFIX Command: dbget <database name>',
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 0 },
  category: 'Owner-Only',
  slashCommand: false,
  prefixCommand: true,
  showInHelp: false,
  beta: true,

  run: async (message, lang, { db }) => {
    const result = db.get(message.content);

    if (!result) return message.customReply(lang('notFound'));
    message.customReply('```json\n' + JSON.stringify(result, null, 2).substring(0, 1987) + '\n```');
  }
}