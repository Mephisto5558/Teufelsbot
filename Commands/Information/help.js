/* eslint camelcase: [warn, {allow: [help_]}] */

const
  { Command, commandTypes } = require('@mephisto5558/command'),
  { help_allQuery, help_categoryQuery, help_commandQuery, help_getCommandCategories, help_getCommands } = require('#Utils/componentHandler');

module.exports = new Command({
  types: [commandTypes.slash, commandTypes.prefix],
  usage: { examples: 'fun joke\n{prefix}{cmdName} fun' },
  dmPermission: true,
  ephemeralDefer: true,
  beta: true,
  options: [
    {
      name: 'category',
      type: 'String',
      autocompleteOptions() {
        return help_getCommandCategories.call(this).map(e => ({
          name: this.client.i18n.__({ locale: 'locale' in this ? this.locale : this.user.localeCode }, `commands.${e}.categoryName`), value: e
        }));
      },
      strictAutocomplete: true
    },
    {
      name: 'command',
      type: 'String',
      autocompleteOptions() { return help_getCommands.call(this).map(e => e.name); },
      strictAutocomplete: true
    }
  ],

  async run(lang) {
    const
      categoryQuery = (
        this.options?.getString('category') ?? this.args?.at(module.exports.options.findIndex(e => e.name == 'category'))
      )?.toLowerCase(),
      commandQuery = (this.options?.getString('command') ?? this.args?.at(module.exports.options.findIndex(e => e.name == 'command')))?.toLowerCase();

    if (commandQuery) return help_commandQuery.call(this, lang, commandQuery);
    if (categoryQuery) return help_categoryQuery.call(this, lang, categoryQuery);
    return help_allQuery.call(this, lang);
  }
});