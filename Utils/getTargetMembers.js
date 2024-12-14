/** @type {import('.').__getTargetMember} */
function getTargetMember(interaction, { targetOptionName, returnSelf }, seenList) {
  if (interaction.inGuild()) {
    let target = interaction.options?.getMember(targetOptionName) ?? interaction.mentions?.members.first();
    if ((!target || seenList.includes(target)) && interaction.content)
      target = interaction.guild.members.cache.find(e => [e.user.id, e.user.username, e.user.globalName, e.nickname].some(e => e && interaction.content.includes(e)));
    if (target && !seenList.includes(target)) return target;
    if (returnSelf) return interaction.member;
  }

  const target = interaction.options?.getUser(targetOptionName) ?? interaction.mentions?.users.first();
  if (target && !seenList.includes(target)) return target;
  if (returnSelf) return interaction.user;
}

/** @type {import('.').getTargetMembers} */
module.exports = function getTargetMembers(interaction, targetSettings = [{}]) {
  const members = (Array.isArray(targetSettings) ? targetSettings : [targetSettings]).reduce((acc, { targetOptionName, returnSelf }, i) => {
    acc.push(getTargetMember(interaction, { targetOptionName: targetOptionName ?? `target${i || ''}`, returnSelf }, acc));
    return acc;
  }, []);

  return Array.isArray(targetSettings) ? members : members[0];
};