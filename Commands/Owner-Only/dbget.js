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

  run: async(client, message) => {
    const result = await client.db.get(message.content);
    
    message.channel.send(
      '```json\n' +
      JSON.stringify(result || 'nothing found', null, 2) +
      '\n```'
    )
  }
})