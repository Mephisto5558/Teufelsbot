const
  { OptionType, inlineCode } = require('discord.js'),
  { CommandOption, OptionType } = require('@mephisto5558/command'),
  MAX_PREFIXES_PER_GUILD = 2;

/** @type {CommandOption<['slash']>} */
module.exports = new CommandOption({
  name: 'add_prefix',
  type: OptionType.Subcommand,
  options: [
    {
      name: 'new_prefix',
      type: OptionType.String,
      required: true
    },
    { name: 'case_insensitive', type: OptionType.Boolean }
  ],

  async run(lang) {
    const
      newPrefixes = [{ prefix: this.options.getString('new_prefix', true), caseinsensitive: this.options.getBoolean('case_insensitive') }],
      prefixInDB = this.guild.prefixes.find(e => newPrefixes[0].prefix == e.prefix);

    newPrefixes[0].caseinsensitive ??= prefixInDB?.caseinsensitive ?? false;
    if (!prefixInDB && this.guild.db.config.prefixes[this.client.botType]?.length >= MAX_PREFIXES_PER_GUILD)
      return this.customReply(lang('limitReached'));

    if (!this.guild.db.config.prefixes[this.client.botType]?.length) newPrefixes.unshift(...this.client.prefixes);

    await this.client.db.pushToSet('guildSettings', `${this.guild.id}.config.prefixes.${this.client.botType}`, ...newPrefixes);
    return this.customReply(lang('saved', inlineCode(newPrefixes[0].prefix)));
  }
});