const { inlineCode } = require('discord.js');

module.exports = {
  /** @type {NonNullable<command<'slash'>['options']>[number]['options']} */
  options: [
    {
      name: 'prefix',
      type: 'String',
      autocompleteOptions() { return this.guild.db.config[this.client.botType == 'dev' ? 'betaBotPrefixes' : 'prefixes']?.map(e => e.prefix) ?? []; },
      strictAutocomplete: true,
      required: true
    }
  ],

  /** @type {command<'slash'>['run']} */
  async run(lang) {
    const
      prefix = this.options.getString('prefix', true),
      db = this.guild.db.config[`${this.client.botType == 'dev' ? 'betaBotP' : 'p'}refixes`];

    if (db.length < 2) return this.customReply(lang('cannotRemoveLastPrefix'));

    await this.guild.updateDB(`config.${this.client.botType == 'dev' ? 'betaBotP' : 'p'}refixes`, db.filter(e => e.prefix != prefix));
    return this.customReply(lang('removed', inlineCode(prefix)));
  }
};