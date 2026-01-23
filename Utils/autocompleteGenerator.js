/** @import { autocompleteGenerator } from '.' */

const
  { BaseInteraction } = require('discord.js'),
  { autocompleteOptionsMaxAmt } = require('./constants');

/**
 * @this {ThisParameterType<autocompleteGenerator>}
 * @param {string} searchValue
 * @param {lang<true>} lang
 * @param {commandOptions['autocompleteOptions'] | { name: unknown, value: unknown } | undefined} options
 * @returns {Promise<[] | { name: string, value: string | number }[]>} */
async function autocompleteFormatter(searchValue, lang, options) {
  if (!options) return [];

  if (typeof options == 'function') return autocompleteFormatter.call(this, searchValue, lang, await options.call(this, searchValue));
  if (typeof options == 'string') return [{ name: lang(options) ?? options, value: options }];

  if (Array.isArray(options)) {
    return (await Promise.all(
      options
        .filter(e => !searchValue || (typeof e == 'object' ? e.value.toLowerCase() : e.toString().toLowerCase()).includes(searchValue.toLowerCase()))
        .slice(0, autocompleteOptionsMaxAmt)
        .map(autocompleteFormatter.bind(this, searchValue, lang))
    )).flat();
  }

  if (typeof options == 'object') return [options];

  return [options];
}

/** @type {autocompleteGenerator} */
module.exports = async function autocompleteGenerator(command, target, locale) {
  const
    group = this instanceof BaseInteraction ? this.options.getSubcommandGroup(false) : undefined,
    subcommand = this instanceof BaseInteraction ? this.options.getSubcommand(false) : undefined;

  /** @type {commandOptions[]} */
  let [...options] = command.options;
  if (group) ({ options } = options.find(e => e.name == group));
  if (subcommand) ({ options } = options.find(e => e.name == subcommand));

  const lang = this.client.i18n.getTranslator({
    locale, undefinedNotFound: true,
    backupPaths: [[
      'commands', command.category, command.name, 'options',
      ...group ? [group, 'options'] : [],
      ...subcommand ? [subcommand, 'options'] : [],
      target.name, 'choices'
    ].join('.')]
  });

  return autocompleteFormatter.call(this, target.value, lang, options.find(e => e.name == target.name)?.autocompleteOptions);
};