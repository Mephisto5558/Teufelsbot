const
  { inlineCode } = require('discord.js'),
  { CommandOption } = require('@mephisto5558/command');

/** @type {CommandOption<['slash']>} */
module.exports = new CommandOption({
  name: 'remove_prefix',
  type: 'Subcommand',
  options: [
    {
      name: 'prefix',
      type: 'String',
      autocompleteOptions() { return this.guild.db.config.prefixes[this.client.botType]?.map(e => e.prefix) ?? []; },
      strictAutocomplete: true,
      required: true
    }
  ],

  async run(lang) {
    const prefix = this.options.getString('prefix', true);

    if (this.guild.prefixes.length < 2) await this.guild.deleteDB(`config.prefixes.${this.client.botType}`);
    else await this.guild.updateDB(`config.prefixes.${this.client.botType}`, this.guild.prefixes.filter(e => e.prefix != prefix));

    return this.customReply(lang('removed', inlineCode(prefix)));
  }
});