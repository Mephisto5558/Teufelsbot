module.exports = async client => {

  client.guilds.cache.forEach(guild => {
    if(!client.guildWhitelist.includes(guild.id)) {
      guild.leave();
      console.log(`Left ${guild.name}(${guild.id}) because it's not in the whitelist`);
    }
  });

  console.log(`Ready to serve in ${client.channels.cache.size} channels on ${client.guilds.cache.size} servers, for a total of ${client.guilds.cache.map((g) => g.memberCount).reduce((a, c) => a + c)} users.\n`);
  await client.functions.sleep(20000);
  client.user.setActivity({ name: "no one found the easter egg yet! | /help", type: "PLAYING" });
}