const types = require('discord-dashboard').formTypes;

module.exports = client => ({
  id: 'joinChannel',
  name: 'Welcome Channel',
  description: 'Select the channel to send the welcome message to',
  position: 1,
  type: types.channelsSelect(false, ['GUILD_TEXT']),

  get: async ({ guild }) => {
    return await guild.object.channels.fetch(client.db.get('settings')?.[guild.id]?.welcome?.channel);
  },

  set: async ({ guild, newData }) => {
    const oldData = await client.db.get('settings');
    let guildData = oldData[guild.id];

    if (!guildData) guildData = { welcome: { channel: newData.id } };
    else if (!guildData.welcome) guildData.welcome = { channel: newData.id };
    else guildData.welcome.channel = newData.id;

    return client.db.set('settings', { ...oldData, [guild.id]: guildData });
  }
})