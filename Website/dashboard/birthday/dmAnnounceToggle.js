const types = require('discord-dashboard').formTypes;

module.exports = client => ({
  id: 'dmAnnounceEnable',
  name: 'Enable dm messages',
  description: 'DM the member on his/her birthday with a custom message',
  position: 4,

  type: types.switch(),

  get: async ({ guild }) => {
    return await client.db.get('settings')?.[guild.id]?.birthday?.dmAnnouncement?.enabled;
  },
  set: async ({ guild, newData }) => {
    const oldData = await client.db.get('settings');
    const guildData = oldData[guild.id] || { birthday: { dmAnnouncement: { enabled: '' } }};

    if (!guildData.birthday) guildData.birthday = { dmAnnouncement: { enabled: newData } };
    else if(!guildData.birthday.dmAnnouncement) guildData.birthday.dmAnnouncement = { enabled: newData };
    else guildData.birthday.dmAnnouncement.enabled = newData;

    return client.db.set('settings', { ...oldData, [guild.id]: guildData });
  }
})