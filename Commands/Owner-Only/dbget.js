const { Command } = require('reconlx');

module.exports = new Command({
  name: 'dbget',
  alias: [],
  description: 'query data from the database',
  usage: 'PREFIX Command: dbget <database>',
  permissions: { client: [], user: [] },
  cooldowns: { global: 0, user: 0 },
  category: 'Owner-Only',
  slashCommand: false,
  prefixCommand: true,
  showInHelp: false,
  beta: true,

  run: async(client, message) => {
    let messageToEdit;

    await message.reply('Loading...')
      .then(msg => { messageToEdit = msg});

    let result = await client.db.get(message.content);
    if(!result) result = 'nothing found'

    messageToEdit.edit('```json\n' + JSON.stringify(result, null, 2) + '\n```');

  }
})