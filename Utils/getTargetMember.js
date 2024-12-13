/** @type {import('.').getTargetMember} */
module.exports = function getTargetMember(interaction, { targetOptionName = 'target', returnSelf } = {}) {
  if (interaction.inGuild()) {
    let target = interaction.options?.getMember(targetOptionName) ?? interaction.mentions?.members.first();
    if (!target && interaction.content)
      target = interaction.guild.members.cache.find(e => [e.user.id, e.user.username, e.user.globalName, e.nickname].some(e => [...interaction.args ?? [], interaction.content].includes(e)));
    if (target) return target;
    if (returnSelf) return interaction.member;
  }

  const target = interaction.options?.getUser(targetOptionName) ?? interaction.mentions?.users.first();
  if (target) return target;
  if (returnSelf) return interaction.user;
};