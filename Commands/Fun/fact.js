const { get } = require('axios');

module.exports = {
  name: 'fact',
  cooldowns: { guild: 100 },
  category: 'Fun',
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,

  run: async function () {
    const res = await get('https://api.api-ninjas.com/v1/facts', {
      headers: { 'X-Api-Key': this.client.keys.FunFactAPI },
      contentType: 'application/json',
    });

    this.customReply(`${res.data[0].fact}.`);
  }
};