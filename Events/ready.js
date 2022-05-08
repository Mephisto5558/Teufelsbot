module.exports = async client => {
  client.guilds.cache.forEach(guild => {
    if(!client.guildWhitelist.includes(guild.id)) {
      guild.leave();
      client.log(`Left ${guild.name}(${guild.id}) because it's not in the whitelist`);
    }
  });

  client.log('Ready to receive prefix commands');
  await client.functions.sleep(20000);
  client.user.setActivity({ name: "no one found the easter egg yet! | /help", type: "PLAYING" });
}