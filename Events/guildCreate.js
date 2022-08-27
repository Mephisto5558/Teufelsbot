module.exports = async (client, guild) => {
  try {
    const oldData = await client.db.get('guildSettings');
    const newData = oldData.fMerge({ [guild.id]: { position: (Object.values(oldData).sort((a, b) => b.position - a.position)[0].position || 0) + 1} });

    await client.db.set('guildSettings', newData);
    await require('../Handlers/slash_command_handler.js')(client, guild);
  } catch { }
}
