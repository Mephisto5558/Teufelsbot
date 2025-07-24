/** @type {import('@mephisto5558/bot-website').dashboardSetting} */
module.exports = {
  id: 'prefixes',
  name: 'Prefix',
  description: "The bot's prefixes",
  type: 'tagInput',
  position: 2,

  get(option, options) {
    return (
      this.db.get('guildSettings', `${options.guild.id}.${option.optionId}`)
      ?? this.db.get('botSettings', `defaultGuild.${option.optionId}`)
    ).map(e => e.prefix);
  },
  async set(option, options) {
    return this.db.pushToSet('guildSettings', `${options.guild.id}.${option.optionId}`, ...options.data);
  }
};