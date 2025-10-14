/** @import subcommand from '.' */

const { inlineCode } = require('discord.js');

/** @type {subcommand} */
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
    const prefix = this.options.getString('new_prefix', true);

    await this.guild.updateDB(
      `config.prefixes.${this.client.botType}`,
      [{ prefix, caseinsensitive: this.options.getBoolean('case_insensitive') ?? false }]
    );

    return this.customReply(lang('saved', inlineCode(prefix)));
  }
};