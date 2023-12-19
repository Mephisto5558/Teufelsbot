/**
 * @this Message|Interaction @param {object}options
 * @param {boolean?}options.returnSelf return this.channel if nothing else has been found @param {string?}options.targetOptionName the option name for `this.options.getX(targetOptionName)`.
 * @returns {import('discord.js').Channel|undefined}will return undefined if none found.*/
module.exports = function getTargetChannel({ targetOptionName = 'channel', returnSelf } = {}) {
  let target = this.options?.getChannel(targetOptionName) || this.mentions?.channels.first();
  if (!target && this.content) target = this.guild.channels.cache.find(e => [e.id, e.name].some(e => [...(this.args || []), this.content].includes(e)));
  if (target) return target;
  if (returnSelf) return this.channel;
};