/** this.customId: `topic`
 * @this {import('discord.js').ButtonInteraction}*/
module.exports = function topic(lang) {
  lang.__boundArgs__[0].backupPath = 'commands.fun.topic';

  this.update({ components: [] });

  this.client.slashCommands.get('topic').run.call(this, lang);
};