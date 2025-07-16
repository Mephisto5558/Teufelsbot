const { inlineCode } = require('discord.js');

/** @type {import('.')} */
module.exports = {
  options: [
    {
      name: 'prefix',
      type: 'String',
      autocompleteOptions() { return this.guild.db.config[this.client.botType == 'dev' ? 'betaBotPrefixes' : 'prefixes']?.map(e => e.prefix) ?? []; },
      strictAutocomplete: true,
      required: true
    }
  ],

  async run(lang) {
    const
      prefix = this.options.getString('prefix', true),
      prefixType = `${this.client.botType == 'dev' ? 'betaBotP' : 'p'}refixes`,
      db = this.guild.db.config[prefixType];

    await (db.length < 2 ? this.guild.deleteDB(`config.${prefixType}`) : this.guild.updateDB(`config.${prefixType}`, db.filter(e => e.prefix != prefix)));
    return this.customReply(lang('removed', inlineCode(prefix)));
  }
};