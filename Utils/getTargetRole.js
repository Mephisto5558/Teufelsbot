/**
 * @this {Interaction|Message}
 * @param {{ targetOptionName?: string, returnSelf?: boolean }}options
 * @param {string?}options.targetOptionName the option name for `this.options.getX(targetOptionName)`.
 * @param {boolean?}options.returnSelf return this.member.roles.highest if nothing else has been found
 * @returns {import('discord.js').Role|undefined}
 */
module.exports = function getTargetRole({ targetOptionName = 'target', returnSelf } = {}) {
  /** @type {import('discord.js').Role?}*/
  let target = this.options?.getRole(targetOptionName) ?? this.mentions?.roles.first();
  if (!target && this.content) target = this.guild.roles.cache.find(e => [e.id, e.name].some(e => [...this.args ?? [], this.content].includes(e)));
  if (target) return target;
  if (returnSelf) return this.member.roles.highest;
};