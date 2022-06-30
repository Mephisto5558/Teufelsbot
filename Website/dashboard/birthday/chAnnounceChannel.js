const types = require('discord-dashboard').formTypes;

module.exports = client => ({
  id: 'chAnnounceChannel',
  name: 'Channel',
  description: 'The channel to witch the birthday announcement will get send',
  position: 2,

  type: types.channelsSelect(false, ['GUILD_TEXT']),

  get: async ({ guild }) => {
    return await client.db.get('settings')?.[guild.id]?.birthday?.channelAnnouncement?.channel;
  },
  set: async ({ guild, newData }) => {
    const oldData = await client.db.get('settings');
    const guildData = oldData[guild.id] || { birthday: { channelAnnouncement: { channel: '' } }};

    if (!guildData.birthday) guildData.birthday = { channelAnnouncement: { channel: newData } };
    else if(!guildData.birthday.channelAnnouncement) guildData.birthday.channelAnnouncement = { channel: newData };
    else guildData.birthday.channelAnnouncement.channel = newData;

    return client.db.set('settings', { ...oldData, [guild.id]: guildData });
  }
})