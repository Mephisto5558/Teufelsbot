const { Command } = require('reconlx');

module.exports = new Command({
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

  run: async ({ db }, message) => {
    const result = await db.get(message.content);

    message.channel.send(!result ? 'nothing found' : (
      '```json\n' + JSON.stringify(result, null, 2)
    ).substring(0, 1996) + '\n```');
  }
})