const { get } = require('axios').default;

module.exports = {
  name: 'fact',
  aliases: { prefix: [], slash: [] },
  description: 'Get some facts',
  usage: '',
  permissions: { client: [], user: [] },
  cooldowns: { guild: 100, user: 0 },
  category: 'Fun',
  slashCommand: false,
  prefixCommand: true,

  run: async (message, _, { keys }) => {
    try {
      const res = await get('https://api.api-ninjas.com/v1/facts', {
        headers: { 'X-Api-Key': keys.FunFactAPI },
        contentType: 'application/json',
      });

      message.customreply(`${res.data[0].fact}.`);
    }
    catch (err) { client.error(err) }
  }
}