/** @type {import('.').__getTargetMember} */
function getTargetMember(interaction, { targetOptionName, returnSelf }, seenList) {
  if (interaction.inGuild()) {
    let target = interaction.options?.getMember(targetOptionName) ?? interaction.mentions?.members.at(seenList.length) ?? interaction.mentions?.members.first();
    if (seenList.has(target?.id)) target = undefined;
    if (!target && interaction.content) {
      target = interaction.guild.members.cache.find(e => !seenList.has(e.id) && [e.user.id, e.user.username, e.user.globalName, e.nickname, e.customName]
        .some(e => e && interaction.content.includes(e)));
    }
    if (target) return target;
    if (returnSelf) return interaction.member;
  }

  const target = interaction.options?.getUser(targetOptionName) ?? interaction.mentions?.users.at(seenList.length) ?? interaction.mentions?.users.first();
  if (target && !seenList.has(target.id)) return target;
  if (returnSelf) return interaction.user;
}

/** @type {import('.').getTargetMembers} */
module.exports = function getTargetMembers(interaction, targetSettings = []) {
  if (!targetSettings.length) return;

  const members = [...(Array.isArray(targetSettings) ? targetSettings : [targetSettings]).reduce((/** @type {Map}*/acc, { targetOptionName, returnSelf }, i) => {
    const member = getTargetMember(interaction, { targetOptionName: targetOptionName ?? `target${i || ''}`, returnSelf }, acc);
    acc.set(member?.id ?? `target${i || ''}`, member);
    return acc;
  }, new Map()).values()];

  return Array.isArray(targetSettings) && targetSettings[0].__count__ ? members : members[0];
};