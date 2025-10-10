/** @import { dashboardSetting } from '#types/locals' */

/** @type {dashboardSetting} */
module.exports = {
  id: 'prefixes',
  name: 'Prefix',
  description: "The bot's prefixes",
  type: 'tagInput',
  position: 2,

  get(option, options) {
    /** @type {{ optionId: 'config.prefixes' }} */
    const { optionId } = option;
    return (
      this.db.get('guildSettings', `${options.guild.id}.${optionId}`)
      ?? this.db.get('botSettings', `defaultGuild.${optionId}`)
    ).map(e => e.prefix);
  },
  async set(option, options) {
    return this.db.pushToSet('guildSettings', `${options.guild.id}.${option.optionId}`, ...options.data);
  }
};