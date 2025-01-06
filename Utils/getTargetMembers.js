/**
 * @template T
 * @param {string}query
 * @param {(e: T) => boolean}filter
 * @param {import('discord.js').Collection<Snowflake, T>}cache
 * @returns {T | undefined} */
const searchCache = (query, filter, cache) => cache.find(e => filter(e) && [
  e.id, e.user?.username ?? e.username, e.user?.globalName ?? e.globalName, e.nickname, e.customName
].some(e => !!e && query.includes(e)));

/** @type {import('.').__getTargetMember} */
function getTargetMember(interaction, { targetOptionName, returnSelf }, seenList) {
  if (interaction.inGuild()) {
    let target = interaction.options?.getMember(targetOptionName) ?? interaction.mentions?.members.at(seenList.length) ?? interaction.mentions?.members.first();
    if (interaction.content) {
      if (!target || seenList.has(target.id)) target = searchCache(interaction.content, e => !seenList.has(e.id), interaction.guild.members.cache);
      target ??= searchCache(interaction.content, e => !seenList.has(e.id), interaction.client.users.cache);
    }

    if (target && !seenList.has(target.id)) return target;
    return returnSelf && !seenList.has(interaction.member.id) ? interaction.member : undefined;
  }

  let target = interaction.options?.getUser(targetOptionName) ?? interaction.mentions?.users.at(seenList.length) ?? interaction.mentions?.users.first();
  if ((!target || seenList.has(target.id)) && interaction.content) target = searchCache(interaction.content, e => !seenList.has(e.id), interaction.client.users.cache);
  if (target && !seenList.has(target.id)) return target;

  if (returnSelf && !seenList.has(interaction.user.id)) return interaction.user;
}

/** @type {import('.').getTargetMembers} */
module.exports = function getTargetMembers(interaction, targetSettings) {
  let settings = Array.isArray(targetSettings) ? targetSettings : [targetSettings];
  if (!targetSettings || !settings.length) settings = [{}];

  const members = [...settings.reduce((/** @type {Map}*/acc, { targetOptionName, returnSelf }, i) => {
    const member = getTargetMember(interaction, { targetOptionName: targetOptionName ?? `target${i || ''}`, returnSelf }, acc);
    acc.set(member?.id ?? `target${i || ''}`, member);
    return acc;
  }, new Map()).values()];

  return Array.isArray(targetSettings) && targetSettings[0].__count__ ? members : members[0];
};