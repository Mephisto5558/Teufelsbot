module.exports = async (client, guild) => {

  await client.db.ready();
  guildWhitelist = await client.db.get('guildWhitelist');
  if(!guildWhitelist.includes(guild.id)) {
    guild.leave();
    client.log(`Left guild "${guild.name}" (${guild.id}) because it's not in the whitelist`);
    (await guild.fetchOwner()).send(
      `Hi. Someone tried to add me to one of your guilds: "${guild.name}"\n` +
      `I am currently a whitelist only bot, so please ask .̔̏𝗠𝗲𝗽𝗵𝗶𝘀𝘁𝗼#5558 (discord.gg/u6xjqzz) to whitelist your guild.`
    );
  }
  else client.log(`Joined ${guild.name} (${guild.id})`);
  
}