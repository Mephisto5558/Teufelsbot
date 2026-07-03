/**
 * @import { User, Collection } from 'discord.js'
 * @import { __getTargetUser, __getTargetMember, getTargetMembers as getTargetMembersT } from '.' */

const { GuildMember, userMention } = require('discord.js');

/**
 * @template {GuildMember | User} T
 * @param {string} query
 * @param {(e: T) => boolean} filter
 * @param {Collection<Snowflake, T>} cache
 * @returns {T | undefined} */
const searchCache = (query, filter, cache) => cache.find(e => filter(e) && [
  ...e instanceof GuildMember ? [e.user.username, e.user.globalName, e.nickname] : [e.username, e.globalName], e.id, e.displayName
].some(e => !!e && (query.includes(e) || e.includes(query))));

/** @type {__getTargetUser} */
function getTargetUser(interaction, { targetOptionName, returnSelf }, seenList) {
  /** @type {User | undefined} */
  let target = 'options' in interaction
    ? interaction.options.getUser(targetOptionName)
    : interaction.mentions.users.at(seenList.size) ?? interaction.mentions.users.first();

  if ('content' in interaction) {
    const botMention = userMention(interaction.client.user.id);
    if (
      target?.id == interaction.client.user.id
      && interaction.content.startsWith(botMention)
      && interaction.content.indexOf(botMention) == interaction.content.lastIndexOf(botMention)
    ) target = undefined;

    if (!target || seenList.has(target.id)) target = searchCache(interaction.content, e => !seenList.has(e.id), interaction.client.users.cache);
  }
  if (target && !seenList.has(target.id)) return target;

  if (returnSelf && !seenList.has(interaction.user.id)) return interaction.user;
}

/** @type {__getTargetMember} */
function getTargetMember(interaction, { targetOptionName, returnSelf, returnUser }, seenList) {
  if (interaction.guild) {
    /** @type {GuildMember | undefined} */
    let target = 'options' in interaction
      ? interaction.options.getMember(targetOptionName)
      : interaction.mentions.members?.at(seenList.size) ?? interaction.mentions.members?.first();

    if ('content' in interaction) {
      const botMention = userMention(interaction.client.user.id);

      if (
        target?.id == interaction.client.user.id
        && interaction.content.startsWith(botMention)
        && interaction.content.indexOf(botMention) == interaction.content.lastIndexOf(botMention)
      ) target = undefined;

      if (!target || seenList.has(target.id)) target = searchCache(interaction.content, e => !seenList.has(e.id), interaction.guild.members.cache);
      target ??= searchCache(interaction.content, e => !seenList.has(e.id), interaction.client.users.cache);
    }

    if (target && !seenList.has(target.id)) return target;
    return returnSelf ? interaction.member ?? interaction.user : undefined;
  }

  return returnUser ? getTargetUser(interaction, { targetOptionName, returnSelf }, seenList) : undefined;
}

/** @type {getTargetMembersT} */
module.exports = function getTargetMembers(interaction, targetSettings = []) {
  const
    /** @type {Map<string, GuildMember | User>} */ map = new Map(),
    members = targetSettings.reduce((acc, options, i) => {
      const
        member = getTargetMember(interaction, { ...options, targetOptionName: options.targetOptionName ?? `target${i || ''}` }, acc),
        id = member?.id ?? `target${i || ''}`;

      acc.set(acc.has(id) ? `${id}${i}` : id, member);
      return acc;
    }, map);

  return members.values().toArray();
};