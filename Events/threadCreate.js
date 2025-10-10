/** @import { ClientEvents } from 'discord.js' */

/** @this {ClientEvents['threadCreate'][0]} */
module.exports = async function threadCreate() {
  /* eslint-disable-next-line unicorn/require-array-join-separator -- false positive: `this` is `ThreadChannel`, not `Array` */
  if (this.joinable) return this.join();
};