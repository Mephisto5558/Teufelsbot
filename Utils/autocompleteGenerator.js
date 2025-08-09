const
  { AutocompleteInteraction } = require('discord.js'),
  { autocompleteOptionsMaxAmt } = require('./constants');

/** @type {import('.').autocompleteGenerator} */
module.exports = function autocompleteGenerator(command, target, locale) {
  const
    group = this instanceof AutocompleteInteraction ? this.options.getSubcommandGroup(false) : '',
    subcommand = this instanceof AutocompleteInteraction ? this.options.getSubcommand(false) : '',

    /** @type {(v: string | number) => import('discord.js').ApplicationCommandOptionChoiceData} */
    response = v => ({ name: this.client.i18n.__({ locale, undefinedNotFound: true },
      `commands.${command.category}.${command.name}.options.`
      + (group ? `${group}.` : '')
      + (subcommand ? `${subcommand}.` : '')
      + target.name
      + `.choices.${v}`) ?? v,
    value: v });

  /** @type {commandOptions[]} */
  let [...options] = command.options;
  if (group) ({ options } = options.find(e => e.name == group));
  if (subcommand) ({ options } = options.find(e => e.name == subcommand));

  /**
   * @type {{ autocompleteOptions: Exclude<commandOptions['autocompleteOptions'], Function> }}
   * Excludes<> because we call autocompleteOptions below if it is a function */
  let { autocompleteOptions } = options.find(e => e.name == target.name) ?? {};
  if (typeof autocompleteOptions == 'function') autocompleteOptions = autocompleteOptions.call(this);

  if (typeof autocompleteOptions == 'string') return [response(autocompleteOptions)];
  if (Array.isArray(autocompleteOptions)) {
    return autocompleteOptions
      .filter(e => !target.value || (
        typeof e == 'object' ? e.value.toLowerCase() : e.toString().toLowerCase()
      ).includes(target.value.toLowerCase()))
      .slice(0, autocompleteOptionsMaxAmt).map(e => (typeof e == 'object' ? e : response(e)));
  }

  return [autocompleteOptions];
};