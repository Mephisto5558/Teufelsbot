module.exports = async client => {

  checkGuilds()
  async function checkGuilds() {
    await client.db.ready();
    guildWhitelist = await client.db.get('guildWhitelist');

    if(guildWhitelist) {
      for await (guild of client.guilds.cache) {
        if(!guildWhitelist.includes(guild[1].id)) {
          (await guild.fetchOwner()).send(
            `Hi. I left one of your guilds: "${guild.name}"\n` +
            `I am currently a whitelist only bot, so please ask .̔̏𝗠𝗲𝗽𝗵𝗶𝘀𝘁𝗼#5558 (discord.gg/u6xjqzz) to whitelist your guild.`
          );
          guild[1].leave();
          client.log(`Left ${guild.name}(${guild.id}) because it's not in the whitelist`);
         
        }
      };
    } else client.log('No guild whitlist found')
  }

  client.log('Ready to receive prefix commands');
  await client.functions.sleep(20000);

  let activity = await client.db.get('activity');
  if(activity) 
    client.user.setActivity(activity);
  else
    client.user.setActivity({
      name: "no one found the easter egg yet! | /help",
      type: "PLAYING"
    });

}