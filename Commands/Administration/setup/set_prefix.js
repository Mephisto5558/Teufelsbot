const addPrefix = require('./set_prefix');

module.exports = {
  /** @type {NonNullable<command<'slash'>['options']>[number]['options']} */
  options: [
    {
      name: 'new_prefix',
      type: 'String',
      required: true
    },
    { name: 'case_insensitive', type: 'Boolean' }
  ],

  /** @type {command<'slash'>['run']} */
  async run(lang) {
    await this.client.db.delete('guildSettings', `${this.guild.id}.config.${this.client.botType == 'dev' ? 'betaBotP' : 'p'}refixes`);
    return addPrefix.run.call(this, lang);
  }
};