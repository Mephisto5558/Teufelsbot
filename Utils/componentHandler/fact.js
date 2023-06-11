/** this.customId: `fact`
 * @this {import('discord.js').ButtonInteraction}*/
module.exports = function fact(lang) {
  lang.__boundArgs__[0].backupPath = 'commands.fun.fact';

  this.update({ components: [] });

  this.client.slashCommands.get('fact').run.call(this, lang);
};