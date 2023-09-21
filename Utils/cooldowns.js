const { ApplicationCommandOptionType, ChatInputCommandInteraction } = require('discord.js');

/**@this {import('discord.js').ChatInputCommandInteraction} Command @returns {number} current cooldown in seconds*/
function subCommandCooldowns(name) {
  const depth = name.split('.').length - 1;
  if (depth >= 2 || !(this instanceof ChatInputCommandInteraction)) return 0;

  const group = this.options.getSubcommandGroup(false);
  if (group && !depth) {
    const { cooldowns } = this.client.slashCommands.get(this.commandName)?.options?.find(e => e.name == group && e.type == ApplicationCommandOptionType.SubcommandGroup) ?? {};
    return cooldown.call(this, { name: `${name}.${group}`, cooldowns });
  }

  const subCmd = this.options.getSubcommand(false);
  if (!subCmd) return 0;

  const { cooldowns } = (group ?? this)?.options?.find?.(e => e.name == subCmd && e.type == ApplicationCommandOptionType.Subcommand) || {};
  if (cooldowns) return cooldown.call(this, { name: group ? `${name}.${group}.${subCmd}` : `${name}.${subCmd}`, cooldowns });
}

/**@this {import('discord.js').Message} Message @returns {number} current cooldown in seconds*/
function cooldown({ name, cooldowns: { guild = 0, user = 0 } = {} }) {
  if (!guild && !user) return subCommandCooldowns.call(this, name);

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

  return cooldown || subCommandCooldowns.call(this, name);
}

module.exports = cooldown;