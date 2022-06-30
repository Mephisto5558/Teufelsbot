module.exports = client => ({
  id: 'leaveMessage',
  name: 'Leave Message',
  description: 'Set your own leave message or embed!',
  position: 4,
  type: global.embedBuilder,

  get: async ({ guild }) => {
    return await client.db.get('settings')?.[guild.id]?.leave?.message;
  },

  set: async ({ guild, newData }) => {
    const oldData = await client.db.get('settings');
    let guildData = oldData[guild.id] || { leave: { message: '' } };

    if (!guildData.leave) guildData.leave = { message: newData };
    else guildData.leave.message = newData;

    return client.db.set('settings', { ...oldData, [guild.id]: guildData });
  }
})