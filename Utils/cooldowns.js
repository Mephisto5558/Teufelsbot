/**@this {import('discord.js').Message} Message @returns {number} current cooldown in seconds*/
module.exports = function cooldown({ name, cooldowns: { guild = 0, user = 0 } = {} }) {
  if (!guild && !user) return 0;

  const
    now = Date.now(),
    { guild: guildTimestamps, user: userTimestamps } = this.client.cooldowns.get(name) ?? this.client.cooldowns.set(name, { guild: new Map(), user: new Map() }).get(name);

  let cooldown = 0;
  if (guild && this.guild) {
    const guildCooldown = guildTimestamps.get(this.guild.id);
    if (guildCooldown > now) cooldown = Math.max(cooldown, Math.round((guildCooldown - now) / 1000));
    else guildTimestamps.set(this.guild.id, now + guild);
  }

  if (user) {
    const userCooldown = userTimestamps.get(this.user.id);
    if (userCooldown > now) cooldown = Math.max(cooldown, Math.round((userCooldown - now) / 1000));
    else userTimestamps.set(this.user.id, now + user);
  }

  return cooldown;
};