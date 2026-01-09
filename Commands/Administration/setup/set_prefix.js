const
  { inlineCode } = require('discord.js'),
  { CommandOption } = require('@mephisto5558/command');

/** @type {CommandOption<['slash']>} */
module.exports = new CommandOption({
  name: 'set_prefix',
  type: 'Subcommand',
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
});