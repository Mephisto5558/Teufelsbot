const types = require('discord-dashboard').formTypes;

module.exports = client => ({
  id: 'leaveChannel',
  name: 'Leave Channel',
  description: 'Select the channel to send the leave message to',
  position: 3,
  type: types.channelsSelect(false, ['GUILD_TEXT']),

  get: async ({ guild }) => {
    return await guild.object.channels.fetch(client.db.get('settings')?.[guild.id]?.leave?.channel);
  },

  set: async ({ guild, newData }) => {
    const oldData = await client.db.get('settings');
    let guildData = oldData[guild.id];

    if (!guildData) guildData = { leave: { channel: newData.id } };
    else if (!guildData.leave) guildData.leave = { channel: newData.id };
    else guildData.leave.channel = newData.id;

    return client.db.set('settings', { ...oldData, [guild.id]: guildData });
  }
})