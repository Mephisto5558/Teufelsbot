const { Command } = require('reconlx');
const axios = require('axios');

module.exports = new Command({
  name: 'fact',
  aliases: { prefix: [], slash: [] },
  description: 'Get some facts',
  usage: 'PREFIX Command: fact',
  permissions: { client: [], user: [] },
  cooldowns: { guild: 100, user: 0 },
  category: 'Fun',
  slashCommand: false,
  prefixCommand: true,

  run: async (client, message) => {
    try {
      const res = await axios.get('https://api.api-ninjas.com/v1/facts', {
        headers: { 'X-Api-Key': client.keys.FunFactAPI },
        contentType: 'application/json',
      });

      client.functions.reply(`${res.data[0].fact}.`, message)
    }
    catch (err) { console.error(err) }
  }
})