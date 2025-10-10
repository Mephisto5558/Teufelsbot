/** @import { getTargetRole } from '.' */

/** @type {getTargetRole} */
module.exports = function getTargetRole(interaction, { targetOptionName = 'target', returnSelf } = {}) {
  let target = interaction.options?.getRole(targetOptionName) ?? interaction.mentions?.roles.first();
  if (!target && interaction.content)
    target = interaction.guild.roles.cache.find(e => [e.id, e.name].some(e => [...interaction.args ?? [], interaction.content].includes(e)));
  if (target) return target;
  if (returnSelf) return interaction.member.roles.highest;
};