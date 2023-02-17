const fetch = require('node-fetch').default;

module.exports = {
  name: 'fact',
  cooldowns: { guild: 100 },
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,

  run: async function() {
    const data = await fetch('https://api.api-ninjas.com/v1/facts', { headers: { 'X-Api-Key': this.client.keys.FunFactAPI } }).then(e => e.json());

    return this.customReply(`${data[0].fact}.`);
  }
};