const { get } = require('axios').default;

module.exports = {
  name: 'fact',
  aliases: { prefix: [], slash: [] },
  permissions: { client: [], user: [] },
  cooldowns: { guild: 100, user: 0 },
  category: 'Fun',
  slashCommand: true,
  prefixCommand: true,

  run: async function (_, { keys }) {
    const res = await get('https://api.api-ninjas.com/v1/facts', {
      headers: { 'X-Api-Key': keys.FunFactAPI },
      contentType: 'application/json',
    });

    this.customReply(`${res.data[0].fact}.`);
  }
}