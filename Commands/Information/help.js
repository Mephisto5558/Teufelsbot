const
  { Command, CommandType, OptionType } = require('@mephisto5558/command'),
  {
    help_allQuery: allQuery, help_categoryQuery: categoryQuery, help_commandQuery: commandQuery,
    help_getCommandCategories: getCommandCategories, help_getCommands: getCommands
  } = require('#Utils/componentHandler');

module.exports = new Command({
  types: [CommandType.Slash, CommandType.Prefix],
  usage: { examples: 'fun joke\n{prefix}{cmdName} fun' },
  dmPermission: true,
  ephemeralDefer: true,
  beta: true,
  options: [
    {
      name: 'category',
      type: OptionType.String,
      autocompleteOptions() {
        return getCommandCategories.call(this).map(e => ({
          name: this.client.i18n.__({ locale: 'locale' in this ? this.locale : this.user.localeCode }, `commands.${e}.categoryName`), value: e
        }));
      },
      strictAutocomplete: true
    },
    {
      name: 'command',
      type: OptionType.String,
      autocompleteOptions() { return getCommands.call(this).map(e => e.name); },
      strictAutocomplete: true
    }
  ],

  async run(lang) {
    const
      category = (
        this.options?.getString('category') ?? this.args?.at(module.exports.options.findIndex(e => e.name == 'category'))
      )?.toLowerCase(),
      command = (this.options?.getString('command') ?? this.args?.at(module.exports.options.findIndex(e => e.name == 'command')))?.toLowerCase();

    if (command) return commandQuery.call(this, lang, command);
    if (category) return categoryQuery.call(this, lang, category);
    return allQuery.call(this, lang);
  }
});