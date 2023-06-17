const utils = require('./help_utils.js');

/** this.customId: `help.<type>`
 * @this {import('discord.js').StringSelectMenuInteraction} @param {'command'|'category'|'all'}type*/
module.exports = async function help(lang, type) {
  lang.__boundArgs__[0].backupPath = 'commands.information.help';

  await this.update({});
  return utils[`${type}Query`]?.call(this, lang, this.values[0]);
};