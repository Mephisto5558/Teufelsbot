const { help_commandQuery, help_categoryQuery, help_allQuery, help_getCommands, help_getCommandCategories } = require('../../Utils/componentHandler/');

module.exports = {
  name: 'help',
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,
  ephemeralDefer: true,
  beta: true,
  options: [
    {
      name: 'category',
      type: 'String',
      autocompleteOptions: help_getCommandCategories,
      strictAutocomplete: true
    },
    {
      name: 'command',
      type: 'String',
      autocompleteOptions: function () { return help_getCommands.call(this).map(e => e.name); },
      strictAutocomplete: true
    }
  ],

  run: function (lang) {
    const
      categoryQuery = this.options?.getString('category'),
      commandQuery = (this.options?.getString('command') || this.args?.[0])?.toLowerCase();

    if (commandQuery) return help_commandQuery.call(this, lang, commandQuery);
    if (categoryQuery) return help_categoryQuery.call(this, lang, categoryQuery);
    return help_allQuery.call(this, lang);
  }
};