const { Collection } = require('discord.js');

module.exports = function cooldown({ name, cooldowns }) {
  if (!this.client.cooldowns.has(name)) this.client.cooldowns.set(name, new Collection());

  const
    now = Date.now(),
    timestamps = this.client.cooldowns.get(name),
    expirationTimeGuild = timestamps.get(`g:${this.guild.id}`),
    expirationTimeUser = timestamps.get(`u:${this.member.id}`);

  if (expirationTimeGuild > now && expirationTimeGuild > expirationTimeUser) return Math.round((expirationTimeGuild - now) / 1000);
  if (expirationTimeUser > now && expirationTimeUser > expirationTimeGuild) return Math.round((expirationTimeUser - now) / 1000);

  if (cooldowns?.guild) timestamps.set(`g:${this.guild.id}`, now + cooldowns.guild);
  if (cooldowns?.user) timestamps.set(`u:${this.member.id}`, now + cooldowns.user);
  return 0;
};