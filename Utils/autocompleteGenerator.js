/**@this Interaction @param {object}command @param {string}locale*/
module.exports = async function autocompleteGenerator(command, locale) {
  const response = v => ({ name: this.client.i18n.__({ locale, undefinedNotFound: true }, `commands.${command.category.toLowerCase()}.${command.name}.options.${this.options?._group ? this.options._group + '.' : ''}${this.options?._subcommand ? this.options._subcommand + '.' : ''}${this.focused.name}.choices.${v}`) ?? v, value: v });

  let { options } = command.fMerge();
  if (this.options?._group) options = options.find(e => e.name == this.options._group);
  if (this.options?._subcommand) options = options.find(e => e.name == this.options._subcommand).options;
  options = options.find(e => e.name == this.focused.name).autocompleteOptions;
  if (typeof options == 'function') options = await options.call(this);
  
  if (options.constructor == Object) return [options];
  return typeof options == 'string' ? [response(options)] : options
    .filter(e => !this.focused.value || (e.toLowerCase?.() || e.value.toLowerCase()).includes(this.focused.value.toLowerCase()))
    .slice(0, 25).map(e => typeof e == 'object' ? e : response(e));
};