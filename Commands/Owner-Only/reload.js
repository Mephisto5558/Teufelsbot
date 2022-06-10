const { Command } = require('reconlx');
const { readdirSync } = require('fs');

module.exports = new Command({
  name: 'reload',
  aliases: [],
  description: 'reloads a command file or all files',
  usage: 'PREFIX Command: reload',
  permissions: { client: [], user: [] },
  cooldowns: { global: '', user: '' },
  category: 'Owner-Only',
  slashCommand: false,
  prefixCommand: true,
  disabled: true,

  run: async(client, message) => {

  }
})