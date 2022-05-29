module.exports = async client => {

  async function checkGuilds() {
    await client.db.ready();
    guildWhitelist = await client.db.get('guildWhitelist');
  
    if(guildWhitelist) {
      for await (let guild of client.guilds.cache) {
        guild = guild[1];
        if(!guildWhitelist.includes(guild.id)) {
          (await guild.fetchOwner()).send(
            `Hi. I left one of your guilds: "${guild.name}"\n` +
            `I am currently a whitelist only bot, so please ask .̔̏𝗠𝗲𝗽𝗵𝗶𝘀𝘁𝗼#5558 (discord.gg/u6xjqzz) to whitelist your guild.`
          );
          guild.leave();
          client.log(`Left ${guild.name}(${guild.id}) because it's not in the whitelist`);
        }
      };
    } else client.log('No guild whitlist found')
  }
  
  async function getGuildPrefix() {
    await client.db.ready();
    let prefixDB = await client.db.get('prefix');
    if(!prefixDB.default) return console.error('no default prefix found')
  
    client.guildData.set('default', { prefix: prefixDB.default });
  
    for await (let guild of client.guilds.cache) {
      guild = guild[1];
      client.guildData.set(guild.id, { prefix: prefixDB[guild.id] || false });
    }
  }

  checkGuilds();
  getGuildPrefix();

  let activity = await client.db.get('activity');
  if(activity) client.user.setActivity(activity);
  else {
    client.user.setActivity({
      name: "no one found the easter egg yet! | /help",
      type: "PLAYING"
    });
  }
  
  client.log('Ready to receive prefix commands');
}