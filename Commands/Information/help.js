const { help_filterCommands, help_commandQuery, help_categoryQuery, help_allQuery } = require('../../Utils/componentHandler/');

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
      choices: ['administration', 'fun', 'information', 'minigames', 'moderation', 'nsfw', 'useful', 'premium', 'others']
    },
    {
      name: 'command',
      type: 'String',
      autocompleteOptions: function () { return [...new Set([...this.client.prefixCommands.filter(help_filterCommands.bind(this)).keys(), ...this.client.slashCommands.filter(help_filterCommands.bind(this)).keys()])]; },
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