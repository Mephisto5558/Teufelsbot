/** 
 * @this Message|Interaction
 * @param {{targetOptionName?: string, returnSelf?: boolean}?}options
 * @param {string?}options.targetOptionName the option name for `this.options.getX(targetOptionName)`.
 * @param {boolean?}options.returnSelf return this.member or this.user if nothing else has been found 
 * @returns {import('discord.js').GuildMember|import('discord.js').User|undefined}will return Member if in guild, else User. if none found, undefined.*/
module.exports = function getTargetMember({ targetOptionName = 'target', returnSelf } = {}) {
  if (this.guild) {
    let target = this.options?.getMember(targetOptionName) || this.mentions?.members.first();
    if (!target && this.content) target = this.guild.members.cache.find(e => [e.user.id, e.user.username, e.user.globalName, e.nickname].some(e => [...(this.args || []), this.content].includes(e)));
    if (target) return target;
    if (returnSelf) return this.member;
  }

  const target = this.options?.getUser(targetOptionName) || this.mentions?.users.first();
  if (target) return target;
  if (returnSelf) return this.user;
};