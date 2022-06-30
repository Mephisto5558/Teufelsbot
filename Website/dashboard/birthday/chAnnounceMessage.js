module.exports = client => ({
  id: 'chAnnounceMsg',
  name: 'Announcement Message',
  description: "The message to send on the user's birthday",
  position: 3,

  type: global.embedBuilder,

  get: async ({ guild }) => {
    const db = await client.db.get('settings');
    return {
      embed: db[guild.id]?.birthday?.channelAnnouncement?.embed || db.default.birthday.channelAnnouncement.embed,
      content: db[guild.id]?.birthday?.channelAnnouncement?.content || db.default.birthday.channelAnnouncement.embed
    }
  },

  set: async ({ guild, newData }) => {
    const oldData = await client.db.get('settings');
    const guildData = oldData[guild.id] || { birthday: { channelAnnouncement: '' }};

    if (!guildData.birthday) guildData.birthday = { channelAnnouncement: newData };
    else guildData.birthday.channelAnnouncement = newData;

    return client.db.set('settings', { ...oldData, [guild.id]: guildData });
  }
})