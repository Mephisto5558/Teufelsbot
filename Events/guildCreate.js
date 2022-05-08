const fs = require("fs");

module.exports = (client, guild) => {
  if (client.guildWhitelist.includes(guild.id)) client.log(`Joined ${guild.name} (${guild.id})`);
  else {
    guild.leave();
    client.log(`Left ${guild.name} (${guild.id}) because it's not in the whitelist`);
  }
}