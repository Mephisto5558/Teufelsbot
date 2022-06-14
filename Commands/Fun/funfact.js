const { Command } = require('reconlx');
const axios = require('axios');

module.exports = new Command({
  name: 'funfact',
  alias: ['fact'],
  description: 'Get some funfacts',
  usage: 'PREFIX Command: funfact',
  permissions: { client: [], user: [] },
  cooldowns: { global: 0, user: 1000 },
  category: 'FUN',
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