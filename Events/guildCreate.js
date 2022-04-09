module.exports = (client, guild) => {
  const fs = require("fs");

  client.guildWhitelist = (fs.readFileSync('./Database/guildWhitelist.db')).toString().split(' ');
  if(client.guildWhitelist.includes(guild.id)) { console.log(`Joined ${guild.name}(${guild.id})`) }
  else {
    guild.leave();
    console.log(`Left ${guild.name}(${guild.id}) because it's not in the whitelist`);  
  }
  guild.commands.set(client.commandList);
}