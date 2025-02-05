/** @type {import('.')} */
module.exports = {
  options: [],

  async run(lang) {
    await (this.guild.db.wordCounter ? this.guild.updateDB('wordCounter.enabled', !this.guild.db.wordCounter.enabled) : this.guild.updateDB('wordCounter', { enabled: true, sum: 0, channels: {} }));
    return this.customReply(lang(this.guild.db.wordCounter.enabled ? 'enabled' : 'disabled'));
  }
};