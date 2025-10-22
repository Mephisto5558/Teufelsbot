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
  let target = interaction.options?.getUser(targetOptionName)
    ?? interaction.mentions?.users.at(seenList.size)
    ?? interaction.mentions?.users.first();

  if (interaction.content) {
    const botMention = userMention(interaction.client.user.id);
    if (
      target && target.id == interaction.client.user.id
      && interaction.content.startsWith(botMention)
      && interaction.content.indexOf(botMention) == interaction.content.lastIndexOf(botMention)
    ) target = undefined;

    if (!target || seenList.has(target.id)) target = searchCache(interaction.content, e => !seenList.has(e.id), interaction.client.users.cache);
  }
  if (target && !seenList.has(target.id)) return target;

  if (returnSelf && !seenList.has(interaction.user.id)) return interaction.user;
}

/** @type {__getTargetMember} */
function getTargetMember(interaction, { targetOptionName, returnSelf }, seenList) {
  if (interaction.inGuild()) {
    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call,
    @typescript-eslint/no-unnecessary-condition -- ts bug */

    /** @type {GuildMember | undefined} */
    let target = interaction.options?.getMember(targetOptionName)
      ?? interaction.mentions?.members.at(seenList.size) ?? interaction.mentions?.members.first();

    if (interaction.content) {
      const botMention = userMention(interaction.client.user.id);
      if (
        target && target.id == interaction.client.user.id
        && interaction.content.startsWith(botMention)
        && interaction.content.indexOf(botMention) == interaction.content.lastIndexOf(botMention)
      ) target = undefined;

      if (!target || seenList.has(target.id)) target = searchCache(interaction.content, e => !seenList.has(e.id), interaction.guild.members.cache);
      target ??= searchCache(interaction.content, e => !seenList.has(e.id), interaction.client.users.cache);
    }

    if (target && !seenList.has(target.id)) return target;
    return returnSelf ? interaction.member ?? interaction.user : undefined;
    /* eslint-enable */
  }

  return getTargetUser(interaction, { targetOptionName, returnSelf }, seenList);
}

/** @type {getTargetMembersT} */
module.exports = function getTargetMembers(interaction, targetSettings) {
  /** @type {NonNullable<Exclude<Parameters<getTargetMembersT>[1], Array>>[] | undefined} */
  let settings = Array.isArray(targetSettings) ? targetSettings : [targetSettings];
  if (!targetSettings || !settings.length) settings = [{}];

  /** @type {ReturnType<__getTargetMember>[]} */
  const members = [...settings.reduce((/** @type {Map<Snowflake, unknown>} */ acc, { targetOptionName, returnSelf }, i) => {
    const
      member = getTargetMember(interaction, { targetOptionName: targetOptionName ?? `target${i || ''}`, returnSelf }, acc),
      id = member?.id ?? `target${i || ''}`;

    acc.set(acc.has(id) ? `${id}${i}` : id, member);
    return acc;
  }, new Map()).values()];

  return Array.isArray(targetSettings) && targetSettings[0].__count__ ? members : members[0];
};