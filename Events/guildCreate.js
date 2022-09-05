module.exports = async (client, guild) => {
  const newData = oldData.fMerge({ [guild.id]: { position: (Object.values(client.db.get('guildSettings')).sort((a, b) => b?.position - a?.position)[0].position || 0) + 1 } });

  client.db.set('guildSettings', newData);
}
