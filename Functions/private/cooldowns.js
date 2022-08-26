const { Collection } = require('discord.js');

module.exports = async (client, { guild, member }, { name, cooldowns }, hc = {}) => {
  if (!client.cooldowns.has(name)) client.cooldowns.set(name, new Collection());

  const
    now = Date.now(),
    timestamps = client.cooldowns.get(name),
    expirationTimeGuild = timestamps.get(hc.id || `g:${guild.id}`) ?? now,
    expirationTimeUser = timestamps.get(hc.id || `u:${member.id}`) ?? now;

  if (expirationTimeGuild > now && expirationTimeGuild > expirationTimeUser) return Math.round((expirationTimeGuild - now) / 1000);
  else if (expirationTimeUser > now && expirationTimeUser > expirationTimeGuild) return Math.round((expirationTimeUser - now) / 1000);
  else {
    timestamps.set(hc.id || `g:${guild.id}`, now + (hc.cd || cooldowns.guild));
    timestamps.set(hc.id || `u:${member.id}`, now + (hc.cd || cooldowns.user));
    return 0;
  }
}