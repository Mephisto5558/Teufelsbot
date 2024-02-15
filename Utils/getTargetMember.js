// jsdoc doesn't understand ternary expressions as return type
/* eslint-disable jsdoc/valid-types */
/* eslint-disable-next-line jsdoc/require-returns-check*/
/**
 * @template {Interaction|Message}T
 * @this {T}
 * @param {{ targetOptionName?: string, returnSelf?: boolean }} options
 * @param {string?} options.targetOptionName the option name for `this.options.getX(targetOptionName)`.
 * @param {boolean?} options.returnSelf return this.member or this.user if nothing else has been found
 * @returns {T extends GuildInteraction | Message<true> ? import('discord.js').GuildMember : import('discord.js').User | undefined}
 */
module.exports = function getTargetMember({ targetOptionName = 'target', returnSelf } = {}) {
  if (this.guild) {
    /** @type {import('discord.js').GuildMember?}*/
    let target = this.options?.getMember(targetOptionName) ?? this.mentions?.members.first();
    if (!target && this.content) target = this.guild.members.cache.find(e => [e.user.id, e.user.username, e.user.globalName, e.nickname].some(e => [...this.args ?? [], this.content].includes(e)));
    if (target) return target;
    if (returnSelf) return this.member;
  }

  const target = this.options?.getUser(targetOptionName) ?? this.mentions?.users.first();
  if (target) return target;
  if (returnSelf) return this.user;
};