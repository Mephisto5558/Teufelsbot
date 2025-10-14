/** @import { dashboardSetting } from '#types/locals' */

/** @type {dashboardSetting} */
module.exports = {
  id: 'prefixes',
  name: 'Prefix',
  description: "The bot's prefixes",
  type: 'tagInput',
  position: 2,

  get(_option, options) {
    return this.client.guilds.cache.get(options.guild.id).prefixes.map(e => e.prefix);
  },
  async set(option, options) {
    if (!Array.isArray(options.data)) throw new Error(`Unexpected data received. Got ${typeof options.data}, expected string[]`);

    // The dashboard always sends nothing at all, see: https://github.com/Mephisto5558/Bot-Website/pull/87#issuecomment-3023783322
    /** @type {string[]} */
    const newPrefixes = options.data.filter(prefix => !this.client.guilds.cache.get(options.guild.id).prefixes.some(e => e.prefix == prefix));
    if (newPrefixes.length) return this.db.push('guildSettings', `${options.guild.id}.${option.optionId}.${this.client.botType}`, ...newPrefixes);
  }
};