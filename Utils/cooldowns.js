const { ApplicationCommandOptionType, BaseInteraction } = require('discord.js');

/** 
 * A wrapper for {@link cooldown}, used for subcommand(group) support.
 * @this BaseInteraction 
 * @param {string}name 
 * @returns {number} current cooldown in seconds*/
function subCommandCooldowns(name) {
  const depth = name.split('.').length - 1;
  if (depth >= 2 || !(this instanceof BaseInteraction)) return 0;

  const group = this.options.getSubcommandGroup(false);
  if (group && !depth) {
    const { cooldowns } = this.client.slashCommands.get(this.commandName)?.options?.find(e => e.name == group && e.type == ApplicationCommandOptionType.SubcommandGroup) ?? {};
    return cooldown.call(this, `${name}.${group}`, cooldowns);
  }

  const subCmd = this.options.getSubcommand(false);
  if (!subCmd) return 0;

  const { cooldowns } = (group ?? this)?.options?.find?.(e => e.name == subCmd && e.type == ApplicationCommandOptionType.Subcommand) || {};
  return cooldowns ? cooldown.call(this, group ? `${name}.${group}.${subCmd}` : `${name}.${subCmd}`, cooldowns) : 0;
}

/** 
 * @this {Message | BaseInteraction}
 * @param {string}name name of the cooldown space, eg. a command name 
 * @param {Record<string, number>}cooldowns
 * @returns {number} current cooldown in seconds*/
function cooldown(name, cooldowns = {}) {
  const
    now = Date.now(),
    timeStamps = this.client.cooldowns.get(name) ?? this.client.cooldowns.set(name, {}).get(name),
    cooldownList = [];

  for (const [name, value] of Object.entries(cooldowns)) {
    if (!value || this[name] === null) continue;

    timeStamps[name] ??= new Map();
    const timestamp = timeStamps[name].get(this[name].id) ?? 0;

    if (timestamp > now) cooldownList.push(Math.round((timestamp - now) / 1000));
    else timeStamps[name].set(this[name].id, now + value);
  }

  return Math.max(cooldownList) || subCommandCooldowns.call(this, name);
}

module.exports = cooldown;