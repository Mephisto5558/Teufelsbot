/** 
 * @this {import('discord.js').AutocompleteInteraction} 
 * @param {command<*, boolean, true>}command 
 * @param {string}locale*/
module.exports = async function autocompleteGenerator(command, locale) {
  const response = v => ({ name: this.client.i18n.__({ locale, undefinedNotFound: true }, `commands.${command.category.toLowerCase()}.${command.name}.options.${this.options?._group ? this.options._group + '.' : ''}${this.options?._subcommand ? this.options._subcommand + '.' : ''}${this.focused.name}.choices.${v}`) ?? v, value: v });

  /** @type {command<'both', boolean, true>}*/
  let { options } = command.fMerge();
  if (this.options?._group) options = options.find(e => e.name == this.options._group);
  if (this.options?._subcommand) options = options.find(e => e.name == this.options._subcommand).options;

  /** @type {commandOptions}*/
  let { autocompleteOptions } = options.find(e => e.name == this.focused.name);
  if (typeof autocompleteOptions == 'function') autocompleteOptions = await autocompleteOptions.call(this);

  if (autocompleteOptions.constructor == Object) return [autocompleteOptions];
  return typeof autocompleteOptions == 'string' ? [response(autocompleteOptions)] : autocompleteOptions
    .filter(e => !this.focused.value || (e.toLowerCase?.() || e.value.toLowerCase()).includes(this.focused.value.toLowerCase()))
    .slice(0, 25).map(e => typeof e == 'object' ? e : response(e));
};