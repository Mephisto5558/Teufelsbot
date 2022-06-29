module.exports = client => ({
  id: 'joinMessage',
  name: 'Welcome Message',
  description: 'Set your own welcome message or embed!',
  position: 2,
  type: embedBuilder(),

  get: async ({ guild }) => {
    return await client.db.get('settings')?.[guild.id]?.welcome?.message;
  },

  set: async ({ guild, newData }) => {
    const oldData = await client.db.get('settings');
    let guildData = oldData[guild.id];

    if (!guildData) guildData = { welcome: { message: newData } };
    else if (!guildData.welcome) guildData.welcome = { message: newData };
    else guildData.welcome.message = newData;

    return client.db.set('settings', { ...oldData, [guild.id]: guildData });
  }
})