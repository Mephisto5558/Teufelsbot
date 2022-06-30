const types = require('discord-dashboard').formTypes;

module.exports = client => ({
  id: 'dmAnnounceMsg',
  name: 'DM Message',
  description: 'The message the member will get, if enabled',
  position: 5,

  type: global.embedBuilder,

  get: async ({ guild }) => {
    const db = await client.db.get('settings');
    return {
      embed: db[guild.id]?.birthday?.dmAnnouncement?.embed || db.default.birthday.dmAnnouncement.embed,
      content: db[guild.id]?.birthday?.dmAnnouncement?.content || db.default.birthday.dmAnnouncement.embed
    }
  },
  set: async ({ guild, newData}) => {
    const oldData = await client.db.get('settings');
    const guildData = oldData[guild.id] || { birthday: { dmAnnouncement: '' }};

    if (!guildData.birthday) guildData.birthday = { dmAnnouncement: newData };
    else guildData.birthday.dmAnnouncement = newData;

    return client.db.set('settings', { ...oldData, [guild.id]: guildData });
  }
})
