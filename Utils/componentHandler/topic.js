/** this.customId: `topic`
 * @this {import('discord.js').ButtonInteraction}*/
module.exports = function fact(lang) {
  lang.__boundArgs__[0].backupPath = 'commands.fun.topic';

  this.update({ components: [] });

  this.client.slashCommands.get('topic').run.call(this, lang);
};