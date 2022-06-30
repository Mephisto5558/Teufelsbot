const types = require('discord-dashboard').formTypes;

module.exports = client => ({
  id: 'lang',
  name: 'Language',
  description: 'The language of the bot',
  position: 1,
  type: types.select({ 'English': 'en', 'German': 'de' }),

  get: async ({ guild }) => {
    return await client.db.get('settings')[guild.id]?.language || await client.db.get('settings').default.language;
  },
  
  set: async ({ guild, newData }) => {
    const oldData = await client.db.get('settings');
    const guildData = oldData[guild.id] || { language: '' };

    guildData.language = newData;

    return client.db.set('settings', { ...oldData, [guild.id]: guildData });
  }
})