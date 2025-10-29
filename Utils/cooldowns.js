/** @import { cooldowns } from '.' */

const
  { ApplicationCommandOptionType, ChatInputCommandInteraction } = require('discord.js'),
  { msInSecond } = require('./timeFormatter');

/**
 * A wrapper for {@link cooldown}, used for subcommand(group) support.
 * @this {ChatInputCommandInteraction}
 * @param {string} name
 * @param {number} maxDepth
 * @returns {number} current cooldown in seconds
 *
 * Default maxDepth=2 */
function subCommandCooldowns(name, maxDepth = 2) {
  const depth = name.split('.').length - 1;
  if (depth >= maxDepth || !(this instanceof ChatInputCommandInteraction)) return 0;

  let groupOptions;
  const
    cmd = this.client.slashCommands.get(this.commandName),
    group = this.options.getSubcommandGroup(false);

  if (!cmd) return 0;

  if (group && !depth) {
    groupOptions = cmd.options?.find(e => e.name == group && e.type == ApplicationCommandOptionType.SubcommandGroup);
    if (groupOptions?.cooldowns) return cooldown.call(this, `${name}.${group}`, groupOptions.cooldowns);
  }

  const subCmd = this.options.getSubcommand(false);
  if (!subCmd) return 0;

  const cooldowns = groupOptions?.options?.find(e => e.name == subCmd && e.type == ApplicationCommandOptionType.Subcommand)?.cooldowns
    ?? cmd.cooldowns;

  if (cooldowns) return cooldown.call(this, group ? `${name}.${group}.${subCmd}` : `${name}.${subCmd}`, cooldowns);
  return 0;
}


/** @type {cooldowns} */
function cooldown(name, cooldowns = {}) {
  const
    now = Date.now(),

    /** @type {Record<string, Map<string, number>>} */
    timeStamps = this.client.cooldowns.get(name) ?? this.client.cooldowns.set(name, {}).get(name),
    cooldownList = [];

  for (const [cdName, value] of Object.entries(cooldowns)) {
    if (!value || this[cdName] == undefined) continue;

    timeStamps[cdName] ??= new Map();
    const timestamp = timeStamps[cdName].get(this[cdName].id) ?? 0;

    if (timestamp > now) cooldownList.push(Math.round((timestamp - now) / msInSecond));
    else timeStamps[cdName].set(this[cdName].id, now + value);
  }

  return Math.max(cooldownList) || subCommandCooldowns.call(this, name);
}

module.exports = cooldown;