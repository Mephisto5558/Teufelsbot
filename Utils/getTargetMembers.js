const { GuildMember } = require('discord.js');

/**
 * @template {GuildMember | import('discord.js').User} T
 * @param {string} query
 * @param {(e: T) => boolean} filter
 * @param {import('discord.js').Collection<Snowflake, T>} cache
 * @returns {T | undefined} */
const searchCache = (query, filter, cache) => cache.find(e => filter(e) && [
  ...e instanceof GuildMember ? [e.user.username, e.user.globalName, e.nickname] : [e.username, e.globalName], e.id, e.customName
].some(e => !!e && query.includes(e)));

/** @type {import('.').__getTargetMember} */
function getTargetMember(interaction, { targetOptionName, returnSelf }, seenList) {
  if (interaction.inGuild()) {
    /* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call -- ts bug */
    let target = interaction.options?.getMember(targetOptionName)
      /* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- ts bug */
      ?? interaction.mentions?.members.at(seenList.length) ?? interaction.mentions?.members.first();
    if (interaction.content) {
      /* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- ts bug */
      if (!target || seenList.has(target.id)) target = searchCache(interaction.content, e => !seenList.has(e.id), interaction.guild.members.cache);
      target ??= searchCache(interaction.content, e => !seenList.has(e.id), interaction.client.users.cache);
    }

    /* eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access -- ts bug */
    if (target && !seenList.has(target.id)) return target;
    return returnSelf && !seenList.has(interaction.member.id) ? interaction.member : undefined;
  }

  let target = interaction.options?.getUser(targetOptionName)
    ?? interaction.mentions?.users.at(seenList.length)
    ?? interaction.mentions?.users.first();
  if ((!target || seenList.has(target.id)) && interaction.content)
    target = searchCache(interaction.content, e => !seenList.has(e.id), interaction.client.users.cache);
  if (target && !seenList.has(target.id)) return target;

  if (returnSelf && !seenList.has(interaction.user.id)) return interaction.user;
}

/** @type {import('.').getTargetMembers} */
module.exports = function getTargetMembers(interaction, targetSettings) {
  /** @type {NonNullable<Exclude<Parameters<import('.').getTargetMembers>[1], Array>>[] | undefined} */
  let settings = Array.isArray(targetSettings) ? targetSettings : [targetSettings];
  if (!targetSettings || !settings.length) settings = [{}];

  /** @type {ReturnType<getTargetMember>[]} */
  const members = [...settings.reduce((acc, { targetOptionName, returnSelf }, i) => {
    const member = getTargetMember(interaction, { targetOptionName: targetOptionName ?? `target${i || ''}`, returnSelf }, acc);
    acc.set(member?.id ?? `target${i || ''}`, member);
    return acc;
  }, new Map()).values()];

  return Array.isArray(targetSettings) && targetSettings[0].__count__ ? members : members[0];
};