const { ApplicationCommandOptionType, ChatInputCommandInteraction } = require('discord.js');

/**
 * A wrapper for {@link cooldown}, used for subcommand(group) support.
 * @this {ChatInputCommandInteraction}
 * @param {string}name
 * @returns {number} current cooldown in seconds*/
function subCommandCooldowns(name) {
  const depth = name.split('.').length - 1;
  if (depth >= 2 || !(this instanceof ChatInputCommandInteraction)) return 0;

  let groupOptions;
  const group = this.options.getSubcommandGroup(false);
  if (group && !depth) {
    groupOptions = this.client.slashCommands.get(this.commandName)?.options?.find(e => e.name == group && e.type == ApplicationCommandOptionType.SubcommandGroup);
    if (groupOptions?.cooldowns) return cooldown.call(this, `${name}.${group}`, groupOptions.cooldowns);
  }

  const subCmd = this.options.getSubcommand(false);
  if (!subCmd) return 0;

  const { cooldowns } = (groupOptions ?? this)?.options?.find?.(e => e.name == subCmd && e.type == ApplicationCommandOptionType.Subcommand) ?? {};
  if (cooldowns) return cooldown.call(this, group ? `${name}.${group}.${subCmd}` : `${name}.${subCmd}`, cooldowns);
  return 0;
}

/**
 * @this {Message | import('discord.js').BaseInteraction}
 * @param {string}name name of the cooldown space, eg. a command name
 * @param {Record<string, number>}cooldowns
 * @returns {number} current cooldown in seconds*/
function cooldown(name, cooldowns = {}) {
  const
    now = Date.now(),
    timeStamps = this.client.cooldowns.get(name) ?? this.client.cooldowns.set(name, {}).get(name),
    cooldownList = [];

  /* eslint-disable-next-line no-shadow */
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