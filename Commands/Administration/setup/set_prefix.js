const addPrefix = require('./add_prefix');

/** @type {import('.')} */
module.exports = {
  options: [
    {
      name: 'new_prefix',
      type: 'String',
      required: true
    },
    { name: 'case_insensitive', type: 'Boolean' }
  ],

  async run(lang) {
    await this.guild.deleteDB(`config.${this.client.botType == 'dev' ? 'betaBotP' : 'p'}refixes`);
    return addPrefix.run.call(this, lang);
  }
};