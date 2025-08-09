const utils = require('./help_utils');

/** @type {import('.').help} */
module.exports = async function help(lang, type) {
  lang.config.backupPath[0] = 'commands.information.help';

  await this.deferUpdate();
  return utils[`${type}Query`].call(this, lang, this.values[0]);
};