async function getGuildPrefix(client) {
  const prefixDB = await client.db.get('prefix');

  if (!prefixDB.default) return console.error('no default prefix in prefixDB found');

  client.guildData.set('default', { prefix: prefixDB.default });

  for await (let guild of client.guilds.cache) {
    guild = guild[1];
    client.guildData.set(guild.id, { prefix: prefixDB[guild.id] || false });
  }
}

async function getAutoPublishGuilds(client) {
  const publishDB = await client.db.get('autopublish');

  if (!publishDB) return;

  for(const guild of publishDB) {
    if(client.guildData[guild]) client.guildData[guild].autoPublish = true
    else client.guildData[guild] = { autoPublish: true };
  }
}

module.exports = async client => {
  getGuildPrefix(client);
  getAutoPublishGuilds(client);

  const activity = await client.db.get('activity');

  client.user.setActivity(
    activity || { name: 'Coding is fun! | /help', type: 'PLAYING' }
  );

  client.log('Ready to receive prefix commands');
}