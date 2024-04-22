/** @this {import('discord.js').ThreadChannel}*/
module.exports = function threadCreate() {
  /* eslint-disable-next-line unicorn/require-array-join-separator -- false positive: `this` is `ThreadChannel`, not `Array` */
  if (this.joinable) this.join();
};