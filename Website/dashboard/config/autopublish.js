const types = require('discord-dashboard').formTypes;

module.exports = client => ({
  id: 'autopublish',
  name: 'Auto Publish',
  description: 'Automatically publish/crosspost every message a user writes in an announcement channel',
  position: 3,
  type: types.switch(),

  get: async ({ guild }) => {
    return await client.db.get('settings')[guild.id]?.autopublish;
  },
  
  set: async ({ guild, newData }) => {
    const oldData = await client.db.get('settings');
    let guildData = oldData[guild.id];

    if (!guildData) guildData = { autopublish: newData };
    else guildData.autopublish = newData;

    return client.db.set('settings', { ...oldData, [guild.id]: guildData });
  }
})