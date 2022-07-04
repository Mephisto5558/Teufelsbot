const { Command } = require('reconlx');
const axios = require('axios');

let response = {};

module.exports = new Command({
  name: 'restart',
  aliases: [],
  description: 'restarts the bot',
  usage: 'PREFIX Command: restart',
  permissions: { client: [], user: [] },
  cooldowns: { guild: '', user: '' },
  category: 'Owner-Only',
  slashCommand: false,
  prefixCommand: true,

  run: async (client, message) => {
    client.log(`Restarting bot, initiated by user '${message.author.tag}'...`);
    await client.functions.reply('Restarting bot...', message);
    
    process.exit(0);
  }
})