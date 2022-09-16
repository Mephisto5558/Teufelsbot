module.exports = async ({db, botType}, guild) => {
  if(botType == 'dev') return;
  
  const newData = db.get('guildSettings').fMerge({ [guild.id]: { position: (Object.values(db.get('guildSettings')).sort((a, b) => b?.position - a?.position)[0].position || 0) + 1 } });
  client.db.set('guildSettings', newData);
}
