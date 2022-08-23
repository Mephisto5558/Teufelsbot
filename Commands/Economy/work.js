const { Command } = require('reconlx');

module.exports = new Command({
  name: 'work',
  aliases: { prefix: [], slash: [] },
  description: 'work for some souls',
  usage: '',
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 21600000 }, //6h
  category: 'Economy',
  slashCommand: true,
  prefixCommand: true,
  beta: true,

  run: async (message, lang, client) => {



  }
})