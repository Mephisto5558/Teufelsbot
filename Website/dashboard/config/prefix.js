const types = require('discord-dashboard').formTypes;

module.exports = client => ({
  id: 'prefix',
  name: 'Prefix',
  description: "The bot's prefix",
  position: 2,
  type: types.input(),

  get: async ({ guild }) => {
    return await client.db.get('settings')[guild.id]?.prefix || await client.db.get('settings').default.prefix;
  },

  set: async ({ guild, newData }) => {
    const oldData = await client.db.get('settings');
    const guildData = oldData[guild.id] || { prefix: '' };

    guildData.prefix = newData;

    return client.db.set('settings', { ...oldData, [guild.id]: guildData });
  }
})