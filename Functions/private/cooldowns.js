const { Collection } = require('discord.js');

module.exports = async (client, { user, guild }, { name, cooldowns }) => {
    if (!client.cooldowns.has(name)) client.cooldowns.set(name, new Collection());

  const
    now = Date.now(),
    timestamps = client.cooldowns.get(name),
    expirationTimeGuild = (timestamps.get(`g:${guild.id}`) ?? now),
    expirationTimeUser = (timestamps.get(`u:${user.id}`) ?? now);

  if (expirationTimeGuild > now && expirationTimeGuild > expirationTimeUser) return Math.round((expirationTimeGuild - now) / 1000);
  else if (expirationTimeUser > now && expirationTimeUser > expirationTimeGuild) return Math.round((expirationTimeUser - now) / 1000);
  else {
    timestamps.set(`u:${user.id}`, now + cooldowns.user);
    timestamps.set(`g:${guild.id}`, now + cooldowns.guild);
  }
}